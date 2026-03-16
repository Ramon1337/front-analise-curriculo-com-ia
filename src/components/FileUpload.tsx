import { useRef, type DragEvent, useState } from 'react';
import './FileUpload.css';

interface Props {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ACCEPTED_EXTENSIONS = ['.pdf', '.txt', '.docx'];

function isValidFile(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  return ACCEPTED_EXTENSIONS.some((ext) =>
    file.name.toLowerCase().endsWith(ext),
  );
}

export default function FileUpload({ file, onFileChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isDocxSelected = !!file && file.name.toLowerCase().endsWith('.docx');

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const selected = files[0];
    if (!isValidFile(selected)) {
      setLocalError('Formato não aceito. Envie um arquivo PDF, DOCX ou TXT.');
      return;
    }
    setLocalError(null);
    onFileChange(selected);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  return (
    <div
      className={`file-upload ${dragging ? 'file-upload--dragging' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragging(false)}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.docx"
        className="file-upload__input"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {file ? (
        <div className="file-upload__info">
          <span
            className={`file-upload__icon ${
              isDocxSelected ? 'file-upload__icon--docx-disabled' : ''
            }`}
          >
            📎
          </span>
          <span
            className={`file-upload__name ${
              isDocxSelected ? 'file-upload__name--docx-disabled' : ''
            }`}
          >
            {file.name}
          </span>
          <button
            type="button"
            className="file-upload__remove"
            onClick={(e) => {
              e.stopPropagation();
              setLocalError(null);
              onFileChange(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
          >
            ✕
          </button>

          {isDocxSelected && (
            <p className="file-upload__docx-disclaimer">
              Suporte DOCX em desenvolvimento. Recomendamos PDF ou TXT no
              momento.
            </p>
          )}
        </div>
      ) : (
        <div className="file-upload__placeholder">
          <span className="file-upload__icon">📁</span>
          <p>Arraste seu currículo aqui ou clique para selecionar</p>
          <small>Formatos aceitos: PDF, DOCX, TXT</small>
        </div>
      )}

      {localError && <p className="file-upload__error">{localError}</p>}
    </div>
  );
}
