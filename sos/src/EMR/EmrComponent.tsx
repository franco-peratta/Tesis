import React, { useEffect, useState } from 'react';
import { Button, Space, Tooltip } from 'antd';
import { SaveOutlined, EditOutlined, FileAddOutlined } from "@ant-design/icons";
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
- **Obra Social / Seguro médico / Medicina Prepaga:** 
- **Número de Afiliado:** 


---

## 📋 Antecedentes Personales y Familiares

-   
- 

---

# Fecha de consulta: 

## 🔍 Motivo de Consulta

-

---

## 🩺 Examen Físico

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
  - **medicación XX mg** – Tomar cada N horas según necesidad  
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
}

export const EmrComponent: React.FC<EMRProps> = ({ initialMarkdown, onSave }) => {
    const [markdown, setMarkdown] = useState(initialMarkdown);
    const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');

    // Vuelve a leer la historia clinica cuando el contenedor la actualiza (por
    // ejemplo, despues de guardar). Sin esto el editor se quedaba con el texto
    // capturado al montarse: al reabrir el panel durante la videollamada se
    // veia la version anterior, y volver a guardar desde ahi sobreescribia la
    // historia con contenido viejo.
    useEffect(() => {
        setMarkdown(initialMarkdown);
    }, [initialMarkdown]);

    const handleEditorChange = ({ text }: { text: string }) => {
        setMarkdown(text);
    };

    const isEmpty = markdown.trim().length === 0;

    const getEditorView = () => {
        return viewMode === 'preview'
            ? { menu: true, md: false, html: true }
            : { menu: true, md: true, html: true };
    };

    return (
        <div className="markdown-editor p-4 border rounded shadow bg-white">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1em' }}>
                <Space direction="horizontal">
                    <Tooltip
                        title={
                            isEmpty
                                ? 'Carga una estructura base (datos del paciente, antecedentes, evolución) que podés editar libremente'
                                : 'La plantilla se puede insertar solo cuando la historia clínica está vacía, para no sobreescribir lo ya cargado'
                        }
                    >
                        <Button
                            icon={<FileAddOutlined />}
                            disabled={!isEmpty}
                            onClick={() => {
                                setMarkdown(clinicalRecordTemplate);
                                setViewMode('edit');
                            }}
                        >
                            Insertar plantilla
                        </Button>
                    </Tooltip>
                    <Button
                        icon={viewMode === 'edit' ? <EditOutlined /> : <EditOutlined rotate={90} />}
                        onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
                    >
                        {viewMode === 'edit' ? 'Vista previa' : 'Editar'}
                    </Button>
                </Space>
            </div>
            <MarkdownEditor
                key={viewMode} // <-- this forces re-mount when viewMode changes
                value={markdown}
                style={{ height: '60vh' }}
                onChange={handleEditorChange}
                renderHTML={(text) => (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                )}
                view={getEditorView()}
            />

            <Button
                onClick={() => {
                    const newMarkdown = markdown.length === 0 ? clinicalRecordTemplate : markdown;
                    setMarkdown(newMarkdown);
                    onSave(newMarkdown);
                }}
                type="primary"
                size="large"
                style={{ marginTop: '2em' }}
            >
                <Space direction="horizontal">
                    <SaveOutlined />
                    Actualizar historia clinica
                </Space>
            </Button>
        </div>
    );

};
