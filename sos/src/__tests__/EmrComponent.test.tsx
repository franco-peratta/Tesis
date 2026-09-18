import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { EmrComponent } from '../EMR/EmrComponent'

// El editor real monta CodeMirror, que no aporta nada en jsdom. Se reemplaza
// por un textarea que refleja el valor recibido, que es justamente lo que
// interesa verificar.
jest.mock('react-markdown-editor-lite', () => ({
  __esModule: true,
  default: ({ value, onChange }: any) => (
    <textarea
      data-testid="emr-editor"
      value={value}
      onChange={(e) => onChange({ text: e.target.value })}
    />
  ),
}))

jest.mock('react-markdown-editor-lite/lib/index.css', () => ({}))

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('remark-gfm', () => ({ __esModule: true, default: () => null }))

const editor = () => screen.getByTestId('emr-editor') as HTMLTextAreaElement

describe('EmrComponent', () => {
  it('shows the clinical record it receives', () => {
    render(<EmrComponent initialMarkdown="Evolución inicial" onSave={jest.fn()} />)
    expect(editor().value).toBe('Evolución inicial')
  })

  it('reloads the record when the container updates it after saving', () => {
    const { rerender } = render(
      <EmrComponent initialMarkdown="Version vieja" onSave={jest.fn()} />
    )
    expect(editor().value).toBe('Version vieja')

    // Es lo que ocurre al guardar: el contenedor pasa la historia actualizada.
    // Antes el editor ignoraba la prop y seguia mostrando la version vieja, y
    // volver a guardar desde ahi sobreescribia lo recien guardado.
    rerender(<EmrComponent initialMarkdown="Version guardada" onSave={jest.fn()} />)

    expect(editor().value).toBe('Version guardada')
  })

  it('keeps what the doctor is typing while the prop stays the same', () => {
    const { rerender } = render(
      <EmrComponent initialMarkdown="Base" onSave={jest.fn()} />
    )

    fireEvent.change(editor(), { target: { value: 'Base + nota en curso' } })
    rerender(<EmrComponent initialMarkdown="Base" onSave={jest.fn()} />)

    expect(editor().value).toBe('Base + nota en curso')
  })

  it('saves exactly what the editor holds', () => {
    const onSave = jest.fn()
    render(<EmrComponent initialMarkdown="Contenido" onSave={onSave} />)

    fireEvent.change(editor(), { target: { value: 'Contenido editado' } })
    fireEvent.click(screen.getByRole('button', { name: /Actualizar historia/i }))

    expect(onSave).toHaveBeenCalledWith('Contenido editado')
  })

  describe('template button', () => {
    it('fills an empty record with the template', () => {
      render(<EmrComponent initialMarkdown="" onSave={jest.fn()} />)

      fireEvent.click(screen.getByRole('button', { name: /Insertar plantilla/i }))

      expect(editor().value).toContain('Expediente Clínico')
      expect(editor().value).toContain('Antecedentes')
    })

    it('is disabled when the record already has content, so nothing is overwritten', () => {
      render(<EmrComponent initialMarkdown="Antecedentes del paciente" onSave={jest.fn()} />)

      expect(screen.getByRole('button', { name: /Insertar plantilla/i })).toBeDisabled()
    })
  })
})
