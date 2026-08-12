"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, ExternalLink, Save } from "lucide-react";
import { toast } from "sonner";
import { createCardAction, updateCardAction } from "@/actions/cards";
import { CopyLinkButton } from "@/components/ui/CopyLinkButton";
import { buildPublicCardUrl, toDateInputValue } from "@/lib/utils";
import { cardFormSchema, type CardFormValues } from "@/lib/validations/card";

interface CardFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    nome: string;
    codigo: string | null;
    cpf: string;
    atribuicao: string | null;
    rg: string | null;
    campus: string | null;
    nascimento: Date | string | null;
    curso: string;
    codigoAcesso: string | null;
    fotoUrl: string;
  };
}

interface CreateResultData {
  id: string;
  publicUrl: string;
}

function resolveDateInputValue(
  value: Date | string | null | undefined,
): string {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  return toDateInputValue(value);
}

export function CardForm({ mode, initialData }: CardFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.fotoUrl ?? null,
  );
  const [fileError, setFileError] = useState<string>("");
  const [resultData, setResultData] = useState<CreateResultData | null>(
    initialData
      ? {
          id: initialData.id,
          publicUrl: buildPublicCardUrl(initialData.id),
        }
      : null,
  );

  const defaultValues = useMemo<CardFormValues>(
    () => ({
      nome: initialData?.nome ?? "",
      codigo: initialData?.codigo ?? "",
      cpf: initialData?.cpf ?? "",
      atribuicao: initialData?.atribuicao ?? "Aluno",
      rg: initialData?.rg ?? "",
      campus: initialData?.campus ?? "",
      nascimento: resolveDateInputValue(initialData?.nascimento),
      curso: initialData?.curso ?? "",
      codigoAcesso: initialData?.codigoAcesso ?? "",
    }),
    [initialData],
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues,
  });

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setFileError("");

    if (!file) {
      setPreviewUrl(initialData?.fotoUrl ?? null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }

  function handleRemovePhoto() {
    setSelectedFile(null);
    setPreviewUrl(initialData?.fotoUrl ?? null);
    setFileError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const publicUrl = resultData?.publicUrl ?? "";

  const onSubmit = handleSubmit((values) => {
    setFileError("");

    if (mode === "create" && !selectedFile) {
      setFileError("Envie uma foto para criar a carteirinha.");
      toast.error("Envie uma foto para criar a carteirinha.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("nome", values.nome);
      formData.set("codigo", values.codigo);
      formData.set("cpf", values.cpf);
      formData.set("atribuicao", values.atribuicao);
      formData.set("rg", values.rg);
      formData.set("campus", values.campus);
      formData.set("nascimento", values.nascimento);
      formData.set("curso", values.curso);
      formData.set("codigoAcesso", values.codigoAcesso);

      if (selectedFile) {
        formData.set("foto", selectedFile);
      }

      const result =
        mode === "create"
          ? await createCardAction(formData)
          : await updateCardAction(initialData!.id, formData);

      if (!result.success) {
        toast.error(result.message);

        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            const message = messages?.[0];
            if (!message) return;

            if (field === "foto") {
              setFileError(message);
              return;
            }

            setError(field as keyof CardFormValues, { message });
          });
        }

        return;
      }

      toast.success(result.message);
      setResultData(result.data ?? null);
      setSelectedFile(null);
      if (mode === "edit") {
        router.refresh();
      }
    });
  });

  return (
    <div className={`surface-card card-form-card ${mode}`}>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: "1.35rem" }}>
          {mode === "create" ? "Nova carteirinha" : "Editar carteirinha"}
        </h2>
        <p className="helper-text" style={{ marginTop: 8 }}>
          Faça o upload da foto, valide os dados e gere o link público da
          carteirinha.
        </p>
      </div>

      <form onSubmit={onSubmit} className="form-grid-single">
        <div className="photo-picker">
          <div className="photo-preview">
            {previewUrl ? (
              <img src={previewUrl} alt="Pré-visualização" />
            ) : (
              <Camera size={34} color="#94a3b8" />
            )}
          </div>

          <div>
            <strong className="photo-title">Foto da carteirinha</strong>
            <p className="helper-text" style={{ marginTop: 8 }}>
              Envie uma imagem JPG, PNG ou WebP com até 5MB. A imagem ficará
              pública no portal da carteirinha.
            </p>

            <div className="photo-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Escolher foto
              </button>

              {(selectedFile || previewUrl) && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={handleRemovePhoto}
                >
                  Remover
                </button>
              )}
            </div>
            <small className="photo-formats">Formatos aceitos: JPG, PNG, WebP • Máx. 5MB</small>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {fileError ? (
              <span className="field-error">{fileError}</span>
            ) : null}
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              {...register("nome")}
              placeholder="Ex: João da Silva"
            />
            {errors.nome ? (
              <span className="field-error">{errors.nome.message}</span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="codigo">Código</label>
            <input
              id="codigo"
              {...register("codigo")}
              placeholder="Ex: 7362946285"
              maxLength={10}
            />
            {errors.codigo ? (
              <span className="field-error">{errors.codigo.message}</span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="cpf">CPF</label>
            <input
              id="cpf"
              {...register("cpf")}
              placeholder="Ex: 123.456.789-00"
            />
            {errors.cpf ? (
              <span className="field-error">{errors.cpf.message}</span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="atribuicao">Atribuição</label>
            <select id="atribuicao" {...register("atribuicao")}>
              <option value="Aluno">Aluno</option>
              <option value="Professor">Professor</option>
              <option value="Funcionário">Funcionário</option>
            </select>
            {errors.atribuicao ? (
              <span className="field-error">{errors.atribuicao.message}</span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="rg">RG</label>
            <input
              id="rg"
              {...register("rg")}
              placeholder="Ex: MG-23.213.415"
            />
            {errors.rg ? (
              <span className="field-error">{errors.rg.message}</span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="campus">Campus</label>
            <input
              id="campus"
              {...register("campus")}
              placeholder="Ex: Campus Poços de Caldas"
            />
            {errors.campus ? (
              <span className="field-error">{errors.campus.message}</span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="nascimento">Nascimento</label>
            <input id="nascimento" type="date" {...register("nascimento")} />
            {errors.nascimento ? (
              <span className="field-error">{errors.nascimento.message}</span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="curso">Curso</label>
            <input
              id="curso"
              {...register("curso")}
              placeholder="Ex: Ciência da Computação"
            />
            {errors.curso ? (
              <span className="field-error">{errors.curso.message}</span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="codigoAcesso">Código de credencial de acesso</label>
            <input
              id="codigoAcesso"
              {...register("codigoAcesso")}
              placeholder="Ex: 00807683"
              maxLength={8}
            />
            {errors.codigoAcesso ? (
              <span className="field-error">{errors.codigoAcesso.message}</span>
            ) : null}
          </div>
        </div>

        <div className="actions-row">
          <button type="submit" className="btn" disabled={isPending}>
            <Save size={16} />
            {isPending
              ? mode === "create"
                ? "Criando carteirinha..."
                : "Salvando alterações..."
              : mode === "create"
                ? "Criar carteirinha"
                : "Salvar alterações"}
          </button>

          {publicUrl ? (
            <>
              <Link href={publicUrl} className="btn-secondary" target="_blank">
                <ExternalLink size={16} />
                Abrir link público
              </Link>
              <CopyLinkButton value={publicUrl} />
            </>
          ) : null}
        </div>
      </form>

    </div>
  );
}
