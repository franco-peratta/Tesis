import React, { useState } from 'react';
import { Button, Space } from 'antd';
import { SaveOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import MarkdownEditor from 'react-markdown-editor-lite';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import 'react-markdown-editor-lite/lib/index.css';

const clinicalRecordTemplate = `
# 🧑‍⚕️ Expediente Clínico: 

- **Doctor(a):** 
- **Nacionalidad:** 
- **Fecha de Nacimiento:** 
- **Edad:**  
- **Sexo:** 
- **Obra Social / Seguro medico / Medicina Prepaga:** 
- **Numero de Afiliado:** 


---

## 📋 Antecedentes Personales y Familiares

-   
- 

---

# Fecha de consulta: 

## 🔍 Motivo de Consulta

-

---

## 🩺 Examen Fisico

| Medición          | Valor        |
|-------------------|--------------|
| Presión arterial  | XX mmHg  |
| Frecuencia cardiaca | XX lpm       |
| Temperatura       | XX °C       |
| Frecuencia respiratoria | XX rpm  |

---

## 🧪 Evolución

-
---

## 💊 Plan de Tratamiento

- Medicamentos recetados:  
  - **medicaion XX mg** – Tomar cada N horas según necesidad  
- 

---

## ✅ Pendientes

- [x] Examen físico  
- [ ] Revisar análisis de sangre

---
`;



interface EMRProps {
    initialMarkdown: string;
    onSave: (markdown: string) => void;
    isEditing?: boolean;
}

export const EmrComponent: React.FC<EMRProps> = ({ initialMarkdown, isEditing = true, onSave }) => {
    const [markdown, setMarkdown] = useState(initialMarkdown);
    const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');

    const handleEditorChange = ({ text }: { text: string }) => {
        setMarkdown(text);
    };

    const getEditorView = () => {
        return viewMode === 'preview'
            ? { menu: true, md: false, html: true }
            : { menu: true, md: true, html: true };
    };

    return (
        <div className="p-4 border rounded shadow bg-white">
            <MarkdownEditor
                value={markdown}
                style={{ height: '60vh' }}
                onChange={handleEditorChange}
                renderHTML={(text) => <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>}
                view={getEditorView()}
            />
            <Button
                onClick={() => {
                    setMarkdown(markdown.length === 0 ? clinicalRecordTemplate : markdown)
                    onSave(markdown.length === 0 ? clinicalRecordTemplate : markdown);
                }}
                type="primary"
                size="large"
                style={{ marginTop: "2em" }}
            >
                <Space direction="horizontal">
                    <SaveOutlined />
                    Actualizar historia clinica
                </Space>
            </Button>
        </div>
    );
};
