'use client';

import {useCallback, useId, useRef, useState} from 'react';
import {API_CONFIG} from '../../config/Constant';
import { useUserData } from '../../redux/store';

/* -------------------------------------------------------------------------- */
/* Config                                                                     */
/* -------------------------------------------------------------------------- */

const MAX_FILE_SIZE_MB = 10; // keep in sync with Multer limits.fileSize on the server
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];
const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls (and .csv on some Windows browsers)
  'text/csv'
];

const FILE_TYPES = [
  {value: 'sk', label: 'SK', needsRegion: false},
  {value: 'cr', label: 'CR', needsRegion: false},
  {value: 'aging', label: 'Aging', needsRegion: false},
  {value: 'aging_monthly', label: 'Aging monthly', needsRegion: true},
  {value: 'aging_daily', label: 'Aging daily', needsRegion: true}
] as const;

type FileTypeValue = (typeof FILE_TYPES)[number]['value'];

type Status =
  | {kind: 'idle'}
  | {kind: 'uploading'; progress: number}
  | {kind: 'success'; message: string}
  | {kind: 'error'; message: string};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

const getExtension = (name: string) => {
  const i = name.lastIndexOf('.');
  return i === -1 ? '' : name.slice(i).toLowerCase();
};

/** Returns an error message, or null if the file is acceptable. */
const validateFile = (file: File): string | null => {
  const ext = getExtension(file.name);

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `"${file.name}" is not supported. Upload an ${ALLOWED_EXTENSIONS.join(', ')} file.`;
  }
  // MIME can be empty for .csv on some systems, so only reject when it is set and wrong
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return `"${file.name}" has an unsupported content type (${file.type}).`;
  }
  if (file.size === 0) {
    return `"${file.name}" is empty.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `"${file.name}" is ${formatSize(file.size)}. The limit is ${MAX_FILE_SIZE_MB} MB.`;
  }
  return null;
};

/* -------------------------------------------------------------------------- */
/* Shared class names                                                         */
/* -------------------------------------------------------------------------- */

const controlClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-60 ' +
  'dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-slate-800';

const helpClass = 'mt-1 block text-[0.8125rem] text-slate-600 dark:text-slate-400';

const decodeJwtHeader = (token: string) => {
  const [header] = token.split('.');

  const base64 = header
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map(char => `%${('00' + char.charCodeAt(0).toString(16)).slice(-2)}`)
      .join('')
  );

  return JSON.parse(json);
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function UploadFileForm() {

  const user = useUserData();
  const typeId = useId();
  const regionInputId = useId();
  const fileInputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [fileType, setFileType] = useState<FileTypeValue | ''>('');
  const [regionId, setRegionId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>({kind: 'idle'});
  const [selectedDate, setSelectedDate] = useState('');

  const selected = FILE_TYPES.find(t => t.value === fileType);
  const uploading = status.kind === 'uploading';
  const canSubmit = !!file && !!fileType && !uploading && (fileType !== 'aging_daily' || !!selectedDate);

  const clearFileInput = () => {
    if (inputRef.current) inputRef.current.value = '';
  };

  const pickFile = useCallback((candidate: File | undefined) => {
    if (!candidate) return;

    const error = validateFile(candidate);
    if (error) {
      setFile(null);
      setStatus({kind: 'error', message: error});
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setFile(candidate);
    setStatus({kind: 'idle'});
  }, []);

  const reset = () => {
    setFile(null);
    setFileType('');
    setRegionId('');
    setSelectedDate('');
    clearFileInput();
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !fileType) return;

    const body = new FormData();
    body.append('type', fileType);
    if (selected?.needsRegion && regionId.trim()) {
      body.append('id_mst_wilayah', regionId.trim());
    }
    if (fileType === 'aging_daily') {
      body.append('date', selectedDate);
    }
    body.append('file', file); // field name must match upload.single('file') on the server

    // XHR instead of fetch so we can show upload progress
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_CONFIG.BASE_URL}/excel`);

      // Get token from Redux
    const token = user?.jwt?.token;

    if (token) {
      console.log(decodeJwtHeader(token));
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    // Other headers required by your backend
    xhr.setRequestHeader('Accept', 'application/json');


    xhr.upload.onprogress = ev => {
      if (ev.lengthComputable) {
        setStatus({kind: 'uploading', progress: Math.round((ev.loaded / ev.total) * 100)});
      }
    };

    xhr.onload = () => {
      let payload: {message?: string} = {};
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        /* non-JSON response */
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        setStatus({kind: 'success', message: payload.message ?? 'Import complete.'});
        reset();
      } else {
        setStatus({
          kind: 'error',
          message: payload.message ?? `Upload failed (HTTP ${xhr.status}).`
        });
      }
    };

    xhr.onerror = () =>
      setStatus({
        kind: 'error',
        message: 'Could not reach the server. Check your connection and try again.'
      });

    setStatus({kind: 'uploading', progress: 0});
    xhr.send(body);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto my-8 flex w-full max-w-lg flex-col gap-5 rounded-lg border border-slate-300 bg-white p-7 leading-normal text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
    >
      <h1 className="text-[1.375rem] font-semibold tracking-tight">Import data file</h1>
      <p className="-mt-2 max-w-[60ch] text-[0.9375rem] text-slate-600 dark:text-slate-400">
        Upload an Excel or CSV file. The first worksheet is imported and its column headers must match
        the table fields.
      </p>
      <p className="-mt-2 max-w-[60ch] text-[0.9375rem] text-slate-600 dark:text-yellow-100">
        Notes: If you are uploading file that includes DATE data, please ensure the date format is DD/MM/YYYY.
      </p>


      {/* File type */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={typeId} className="text-[0.9375rem] font-semibold">
          File type
        </label>
        <select
          id={typeId}
          className={controlClass}
          value={fileType}
          onChange={e => setFileType(e.target.value as FileTypeValue | '')}
          disabled={uploading}
          required
        >
          <option value="">Select a file type</option>
          {FILE_TYPES.map(t => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Region (only for monthly / daily aging) */}
      {selected?.needsRegion && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={regionInputId} className="text-[0.9375rem] font-semibold">
            Region ID
          </label>
          <input
            id={regionInputId}
            className={controlClass}
            type="number"
            inputMode="numeric"
            min={1}
            value={regionId}
            onChange={e => setRegionId(e.target.value)}
            disabled={uploading}
            aria-describedby={`${regionInputId}-help`}
          />
          <span id={`${regionInputId}-help`} className={helpClass}>
            Optional. Used for rows that have no id_mst_wilayah column.
          </span>
        </div>
      )}

      
    {/* Import date — only for Aging daily */}
    {fileType === 'aging_daily' && (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="import-date"
          className="text-[0.9375rem] font-semibold"
        >
          Import Date
        </label>

        <input
          id="import-date"
          type="date"
          className={controlClass}
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          disabled={uploading}
          required
        />

        <span className={helpClass}>
          All imported rows will use this date.
        </span>
      </div>
    )}


      {/* Drop zone */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[0.9375rem] font-semibold" id={`${fileInputId}-label`}>
          File
        </span>
        <div
          onDragOver={e => {
            e.preventDefault();
            if (!uploading) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault();
            setDragging(false);
            if (!uploading) pickFile(e.dataTransfer.files?.[0]);
          }}
          className={[
            'relative flex min-h-30 items-center justify-center rounded-lg border-2 p-4 text-center transition-colors',
            'focus-within:ring-2 focus-within:ring-sky-700 focus-within:ring-offset-2',
            'dark:focus-within:ring-sky-400 dark:focus-within:ring-offset-slate-800',
            'motion-reduce:transition-none',
            dragging
              ? 'border-dashed border-sky-700 bg-sky-50 dark:border-sky-400 dark:bg-sky-950'
              : file
                ? 'border-solid border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-700/40'
                : 'border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-700/40'
          ].join(' ')}
        >
          <input
            ref={inputRef}
            id={fileInputId}
            className="sr-only"
            type="file"
            accept={ALLOWED_EXTENSIONS.join(',')}
            aria-labelledby={`${fileInputId}-label`}
            disabled={uploading}
            onChange={e => pickFile(e.target.files?.[0])}
          />

          {file ? (
            <div className="flex max-w-full flex-col items-center gap-0.5">
              <span className="max-w-full truncate font-semibold">{file.name}</span>
              <span className="text-sm text-slate-600 dark:text-slate-400">{formatSize(file.size)}</span>
              <button
                type="button"
                disabled={uploading}
                onClick={() => {
                  setFile(null);
                  clearFileInput();
                }}
                className="mt-1.5 text-sm text-sky-800 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:text-sky-400 dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-slate-800"
              >
                Remove file
              </button>
            </div>
          ) : (
            <label htmlFor={fileInputId} className="cursor-pointer">
              <strong className="text-sky-800 dark:text-sky-400">Choose a file</strong> or drop it here
              <span className={helpClass}>
                {ALLOWED_EXTENSIONS.join(', ')} up to {MAX_FILE_SIZE_MB} MB
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Progress */}
      {status.kind === 'uploading' && (
        <div
          className="h-2 overflow-hidden rounded-full border border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-700"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={status.progress}
          aria-label="Upload progress"
        >
          <div
            className="h-full bg-sky-700 transition-[width] duration-150 ease-linear motion-reduce:transition-none dark:bg-sky-400"
            style={{width: `${status.progress}%`}}
          />
        </div>
      )}

      {/* Messages */}
      {status.kind === 'error' && (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2.5 text-[0.9375rem] text-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {status.message}
        </p>
      )}
      {status.kind === 'success' && (
        <p
          role="status"
          className="rounded-md bg-green-50 px-3 py-2.5 text-[0.9375rem] text-green-800 dark:bg-green-950 dark:text-green-300"
        >
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded-md bg-sky-800 px-4 py-3 font-semibold text-white hover:bg-sky-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-sky-400 dark:text-slate-900 dark:hover:bg-sky-300 dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-slate-800"
      >
        {status.kind === 'uploading'
          ? status.progress === 100
            ? 'Processing…'
            : `Uploading ${status.progress}%`
          : 'Import file'}
      </button>
    </form>
  );
}