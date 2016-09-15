package golang

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"go/doc"
	"io/ioutil"
	"os/exec"
	"path"
	"regexp"
	"strconv"
	"strings"

	"sourcegraph.com/sourcegraph/sourcegraph/pkg/cmdutil"
	"sourcegraph.com/sourcegraph/sourcegraph/pkg/jsonrpc2"
	"sourcegraph.com/sourcegraph/sourcegraph/pkg/lsp"
)

func (h *Handler) handleHover(ctx context.Context, req *jsonrpc2.Request, params lsp.TextDocumentPositionParams) (*lsp.Hover, error) {
	// Find the range of the symbol
	contents, err := h.readFile(params.TextDocument.URI)
	if err != nil {
		return nil, err
	}
	r, err := rangeAtPosition(params.Position, contents)
	if err != nil {
		return nil, err
	}

	// godef for symbol info
	ofs, valid := offsetForPosition(contents, params.Position)
	if !valid {
		return nil, errors.New("invalid position")
	}
	def, err := godef(ctx, h.goEnv(), h.filePath(params.TextDocument.URI), int(ofs))
	if err != nil {
		return nil, err
	}

	// No position information, but we didn't fail. Assume this is a valid
	// place to click, but we are looking at a string literal/comment/etc.
	if def.Position.Path == "" {
		return &lsp.Hover{}, nil
	}

	// using def position, find its docs.
	uri, err := h.fileURI(def.Position.Path)
	if err != nil {
		return nil, err
	}
	if def.Position.IsDir {
		pkg := strings.TrimPrefix(uri, "stdlib://"+stdlibVersion+"/src/")
		pkg = strings.TrimPrefix(pkg, "file:///gopath/src/")
		return &lsp.Hover{
			Contents: []lsp.MarkedString{lsp.MarkedString{
				Language: "go",
				Value:    "pkg " + pkg,
			}}}, nil
	}
	if uri != params.TextDocument.URI {
		// different file to input. This happens when the definition
		// lives in a different file to what we are hovering over.
		contents, err = ioutil.ReadFile(def.Position.Path)
		if err != nil {
			return nil, err
		}
	}
	docstring, err := docAtPosition(lsp.Position{Line: def.Position.Line - 1, Character: def.Position.Column - 1}, contents)
	if err != nil {
		return nil, err
	}

	title := def.Type.Decl
	if title == "" {
		title = def.Type.Name
	}
	ms := []lsp.MarkedString{{Language: "go", Value: title}}
	if docstring != "" {
		var htmlBuf bytes.Buffer
		doc.ToHTML(&htmlBuf, docstring, nil)
		ms = append(
			ms,
			lsp.MarkedString{
				Language: "text/html",
				Value:    htmlBuf.String(),
			},
			lsp.MarkedString{
				Language: "text/plain",
				Value:    docstring,
			},
		)
	}

	var unitName string
	if def.Type.IsField {
		// Looking backward for type declaration.
		// TODO(unknwon): this is not memory friendly hack,
		// use look backward by byte so only have read and not allocate
		// any new memory.
		lines := bytes.SplitN(contents, []byte("\n"), def.Position.Line)
		for i := len(lines) - 2; i >= 0; i-- {
			line := bytes.TrimSpace(lines[i])
			if !bytes.HasPrefix(line, []byte("type ")) {
				continue
			}
			line = line[5:]
			typName := string(bytes.SplitN(line, []byte(" "), 2)[0])
			unitName = typName + "/" + def.Type.Name
			break
		}
	} else {
		unitName = path.Join(def.Type.Receiver, def.Type.Name)
	}

	// Cut off path before '/src/' and trim suffix of file name.
	unit := uri[strings.Index(uri, "/src/")+5:]
	unit = strings.TrimSuffix(unit, "/"+path.Base(unit))

	defInfo := struct {
		URI      string
		UnitType string
		Unit     string
		Path     string
	}{
		URI:      uri,
		UnitType: "GoPackage",
		Unit:     unit,
		Path:     unitName,
	}
	defInfoB, err := json.Marshal(defInfo)
	if err != nil {
		return nil, err
	}
	ms = append(ms, lsp.MarkedString{
		Language: "text/definfo",
		Value:    string(defInfoB),
	})

	return &lsp.Hover{
		Contents: ms,
		Range:    r,
	}, nil
}

type godefResult struct {
	Position struct {
		IsDir  bool   `json:"is_dir"`
		Path   string `json:"path"`
		Line   int    `json:"line"`
		Column int    `json:"column"`
	} `json:"position"`
	Type struct {
		Name     string `json:"name"`
		IsField  bool   `json:"is_field"`
		Receiver string `json:"receiver"`
		Decl     string `json:"decl"`
	} `json:"type"`
}

// some godef errors are fine:
// * no identifier found - string literal/comments/etc
// * no declaration found - struct literal fields. not supporting for now. https://github.com/sourcegraph/sourcegraph/issues/1104
var godefExpectedStderr = regexp.MustCompile(`(godef: no identifier found|godef: no declaration found for \S+)\n`)

// TODO(unknwon): parse JSON output from godef to have better handling.
func godef(ctx context.Context, env []string, path string, offset int) (*godefResult, error) {
	b, err := cmdOutput(ctx, env, exec.Command("godef", "-json", "-t", "-f", path, "-o", strconv.Itoa(offset)))
	if err != nil {
		if e, ok := err.(*cmdutil.ExitError); ok && godefExpectedStderr.Match(e.ExitError.Stderr) {
			// There is nothing to jump to which we expect (eg string
			// literals, comments). LSP expects us to return an empty
			// position.
			return &godefResult{}, nil
		}
		return nil, fmt.Errorf("%v: %v", err, string(b))
	}

	// Non-JSON response is an error.
	// Errors returned from godef are not in JSON foramt,
	// simply rely on JSON unmarshal error will lose the full
	// error string.
	if len(b) == 0 || b[0] != '{' {
		return nil, fmt.Errorf("error response: %s", b)
	}

	var result *godefResult
	if err = json.Unmarshal(b, &result); err != nil {
		return nil, fmt.Errorf("unmarshal JSON: %s", b)
	}
	result.Type.Decl = strings.SplitN(result.Type.Decl, "\n", 2)[0]
	return result, nil
}
