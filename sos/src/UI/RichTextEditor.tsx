import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"

const modules = {
  toolbar: [
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" }
    ],
    ["link", "image", "video"],
    ["clean"]
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false
  }
}
/*
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
const formats = [
  "header",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video"
]

type Props = {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
}
export const RichTextEditor = ({
  value,
  onChange,
  readOnly = false
}: Props) => (
  <ReactQuill
    theme="snow"
    style={{ zIndex: "999" }}
    modules={modules}
    formats={formats}
    value={value}
    onChange={onChange}
    readOnly={readOnly}
  />
)
