import { useState, type FormEvent } from "react";
import { CalendarCheck, Loader2 } from "lucide-react";
import { TextArea, TextField } from "./Field";
import { useToast } from "./toast-context";
import { useSubmit } from "../hooks/useSubmit";
import { rules, validate, type Errors } from "../lib/validation";
import { addDays, checkViewingDate, isoDate, MAX_DAYS_AHEAD } from "../lib/dates";

export const TIME_SLOTS = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

type Values = { name: string; email: string; phone: string; date: string; time: string; message: string };
interface Result {
  id: number;
  message: string;
}

const SCHEMA = {
  name: [rules.name],
  email: [rules.email],
  phone: [rules.phone],
  date: [(v: string) => checkViewingDate(v)],
  time: [rules.required("Eine Uhrzeit")],
  message: [rules.safeText],
};

export function ViewingForm({ listingId, title }: { listingId: number; title: string }) {
  const today = new Date();
  const [values, setValues] = useState<Values>({ name: "", email: "", phone: "", date: isoDate(addDays(today, 2)), time: "", message: "" });
  const [errors, setErrors] = useState<Errors<Values>>({});
  const { status, result, submit, reset } = useSubmit<object, Result>("/api/viewings");
  const toast = useToast();

  const update = (key: keyof Values, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };
  const set = (key: keyof Values) => (e: { target: { value: string } }) => update(key, e.target.value);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(values, SCHEMA);
    setErrors(found);
    if (Object.keys(found).length) return;
    const data = await submit({ ...values, listing_id: listingId });
    if (data) toast("success", data.message);
    else toast("error", "Die Besichtigung konnte nicht gebucht werden. Bitte versuchen Sie es erneut oder rufen Sie uns an.");
  }

  if (status === "success" && result) {
    return (
      <div className="card p-8 text-center" role="status">
        <CalendarCheck className="mx-auto size-12 text-gold" aria-hidden />
        <h2 className="mt-4 text-3xl">Besichtigung angefragt</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone">{result.message} Ihr Berater bestätigt den Termin in Kürze telefonisch.</p>
        <button type="button" onClick={reset} className="btn-outline mt-6">Weiteren Termin anfragen</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card space-y-5 p-6 sm:p-8" aria-labelledby="viewing-title">
      <div>
        <h2 id="viewing-title" className="text-3xl">Private Besichtigung vereinbaren</h2>
        <p className="mt-1 text-sm text-stone">Besichtigen Sie {title} persönlich oder per Video.</p>
      </div>
      <TextField label="Wunschtermin" type="date" name="date" value={values.date} min={isoDate(addDays(today, 1))} max={isoDate(addDays(today, MAX_DAYS_AHEAD))} onChange={set("date")} error={errors.date} />
      <fieldset>
        <legend className="field-label">Uhrzeit</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {TIME_SLOTS.map((t) => (
            <button key={t} type="button" onClick={() => update("time", t)} aria-pressed={values.time === t} className={`border py-2.5 text-sm transition ${values.time === t ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}>
              {t}
            </button>
          ))}
        </div>
        {errors.time && <p className="field-error mt-1.5" role="alert">Bitte wählen Sie eine Uhrzeit</p>}
      </fieldset>
      <TextField label="Vollständiger Name" name="name" autoComplete="name" maxLength={80} value={values.name} onChange={set("name")} error={errors.name} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="E-Mail" type="email" name="email" autoComplete="email" maxLength={120} value={values.email} onChange={set("email")} error={errors.email} />
        <TextField label="Telefon" type="tel" name="phone" autoComplete="tel" maxLength={20} value={values.phone} onChange={set("phone")} error={errors.phone} />
      </div>
      <TextArea label="Nachricht (optional)" name="message" maxLength={1000} value={values.message} onChange={set("message")} error={errors.message} />
      <button type="submit" className="btn-primary w-full" disabled={status === "submitting"}>
        {status === "submitting" ? <><Loader2 className="size-4 animate-spin" aria-hidden /> Wird gesendet</> : "Besichtigung anfragen"}
      </button>
    </form>
  );
}
