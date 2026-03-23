import { useRef, type DragEvent, useState } from 'react';
import { FolderOpen, Paperclip, X } from 'lucide-react';
import './FileUpload.css';

interface Props {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const ACCEPTED_TYPES = ['application/pdf', 'text/plain'];

const ACCEPTED_EXTENSIONS = ['.pdf', '.txt'];

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

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const selected = files[0];

    if (
      selected.name.toLowerCase().endsWith('.docx') ||
      selected.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      setLocalError(
        'Suporte a DOCX é uma atualização futura.\nPor hora, aceitamos apenas PDF e TXT.',
      );
      return;
    }

    if (!isValidFile(selected)) {
      setLocalError('Formato não aceito. Envie um arquivo PDF ou TXT.');
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
        accept=".pdf,.txt"
        className="file-upload__input"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {file ? (
        <div className="file-upload__info">
          <span className="file-upload__icon">
            <Paperclip size={24} />
          </span>
          <span className="file-upload__name">{file.name}</span>
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
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="file-upload__placeholder">
          <span className="file-upload__icon">
            <FolderOpen
              size={48}
              strokeWidth={1.5}
              color="#fbbf24"
              style={{ marginBottom: '8px' }}
            />
          </span>
          <p>Arraste seu currículo aqui ou clique para selecionar</p>
          <small>
            Formatos aceitos: PDF, TXT
            <br />
            <span style={{ opacity: 0.7 }}>
              *(DOCX será suportado no futuro)
            </span>
          </small>
        </div>
      )}

      {localError && (
        <p className="file-upload__error" style={{ whiteSpace: 'pre-wrap' }}>
          {localError}
        </p>
      )}
    </div>
  );
}
