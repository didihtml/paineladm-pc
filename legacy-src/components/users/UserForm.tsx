import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { UserFormData } from "@/types/user";
import { useRef, useState } from "react";
import { UserCircle } from "lucide-react";

const schema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  codigo: z.string().min(1, "Código obrigatório"),
  atribuicao: z.enum(["Aluno", "Professor", "Funcionário"]),
  rg: z.string().min(1, "RG obrigatório"),
  cpf: z.string().min(11, "CPF inválido"),
  dataNascimento: z.string().min(1, "Data obrigatória"),
  campus: z.string().min(1, "Campus obrigatório"),
  curso: z.string().min(1, "Curso obrigatório"),
  codigoAcesso: z.string().min(1, "Código de acesso obrigatório"),
  foto: z.string().nullable(),
});

interface UserFormProps {
  defaultValues?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => void | Promise<void>;
  onCancel: () => void;
}

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const PHOTO_MAX_WIDTH = 480;
const PHOTO_MAX_HEIGHT = 640;

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 14px",
  fontSize: 13,
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  outline: "none",
  color: "#1e293b",
  background: "#f8fafc",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#64748b",
  marginBottom: 5,
  letterSpacing: 0.3,
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && (
        <p style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{error}</p>
      )}
    </div>
  );
}

export function UserForm({ defaultValues, onSubmit, onCancel }: UserFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues: { atribuicao: "Aluno", foto: null, ...defaultValues },
  });
  const foto = watch("foto");

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);

    if (!file.type.startsWith("image/")) {
      setPhotoError("Selecione uma imagem válida.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError("A foto deve ter no máximo 5MB.");
      e.target.value = "";
      return;
    }

    try {
      const optimizedPhoto = await optimizePhoto(file);
      setValue("foto", optimizedPhoto, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch {
      setPhotoError("Não foi possível processar a imagem selecionada.");
    }

    e.target.value = "";
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Foto */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
          padding: "16px",
          background: "#f8fafc",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: 80,
            height: 88,
            borderRadius: 12,
            flexShrink: 0,
            border: "2px dashed #cbd5e1",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            overflow: "hidden",
          }}
        >
          {foto ? (
            <img
              src={foto}
              alt="Foto"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <UserCircle size={32} color="#cbd5e1" />
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFotoChange}
        />
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#1e293b",
              marginBottom: 4,
            }}
          >
            Foto do usuário
          </p>
          <p style={{ fontSize: 12, color: "#94a3b8" }}>
            JPG, PNG — máx. 5MB. A foto é otimizada antes de salvar.
          </p>
          {photoError && (
            <p style={{ fontSize: 11, color: "#ef4444", marginTop: 6 }}>
              {photoError}
            </p>
          )}
          {foto && (
            <button
              type="button"
              onClick={() => {
                setValue("foto", null, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setPhotoError(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              style={{
                fontSize: 11,
                color: "#ef4444",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                marginTop: 6,
              }}
            >
              Remover
            </button>
          )}
        </div>
      </div>

      {/* Nome */}
      <div style={{ marginBottom: 14 }}>
        <Field label="Nome completo" error={errors.nome?.message}>
          <input
            {...register("nome")}
            style={inputStyle}
            placeholder="Ex: João da Silva"
          />
        </Field>
      </div>

      {/* Grid 2 colunas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <Field label="Código (matrícula)" error={errors.codigo?.message}>
          <input
            {...register("codigo")}
            style={inputStyle}
            placeholder="Ex: 7362946285"
          />
        </Field>
        <Field label="Atribuição" error={errors.atribuicao?.message}>
          <select {...register("atribuicao")} style={inputStyle}>
            <option>Aluno</option>
            <option>Professor</option>
            <option>Funcionário</option>
          </select>
        </Field>
        <Field label="RG" error={errors.rg?.message}>
          <input
            {...register("rg")}
            style={inputStyle}
            placeholder="Ex: MG-22.814.943"
          />
        </Field>
        <Field label="CPF" error={errors.cpf?.message}>
          <input
            {...register("cpf")}
            style={inputStyle}
            placeholder="Ex: 128.146.736-70"
          />
        </Field>
        <Field
          label="Data de Nascimento"
          error={errors.dataNascimento?.message}
        >
          <input
            {...register("dataNascimento")}
            type="date"
            style={inputStyle}
          />
        </Field>
        <Field label="Campus" error={errors.campus?.message}>
          <input
            {...register("campus")}
            style={inputStyle}
            placeholder="Ex: Campus Poços de Caldas"
          />
        </Field>
        <Field label="Curso" error={errors.curso?.message}>
          <input
            {...register("curso")}
            style={inputStyle}
            placeholder="Ex: Administração"
          />
        </Field>
        <Field
          label="Código de Acesso (QR)"
          error={errors.codigoAcesso?.message}
        >
          <input
            {...register("codigoAcesso")}
            style={inputStyle}
            placeholder="Ex: 00807683"
          />
        </Field>
      </div>

      {/* Botões */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          paddingTop: 16,
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "10px 20px",
            fontSize: 13,
            borderRadius: 10,
            cursor: "pointer",
            background: "#fff",
            border: "1px solid #e2e8f0",
            color: "#64748b",
            fontFamily: "inherit",
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          style={{
            padding: "10px 24px",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 10,
            cursor: "pointer",
            background: "#1a3a6b",
            border: "none",
            color: "#fff",
            fontFamily: "inherit",
          }}
        >
          Salvar
        </button>
      </div>
    </form>
  );
}

async function optimizePhoto(file: File) {
  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  const { width, height } = resizeImage(
    image.naturalWidth,
    image.naturalHeight,
  );
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return source;
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", 0.82);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () =>
      reject(reader.error ?? new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Falha ao carregar imagem"));
    image.src = source;
  });
}

function resizeImage(width: number, height: number) {
  const ratio = Math.min(PHOTO_MAX_WIDTH / width, PHOTO_MAX_HEIGHT / height, 1);

  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}
