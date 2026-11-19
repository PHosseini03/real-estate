import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { SelectField, TextArea, TextField } from "../components/Field";
import { Reveal } from "../components/Reveal";
import { useToast } from "../components/toast-context";
import { useSubmit } from "../hooks/useSubmit";
import { rules, validate, type Errors } from "../lib/validation";
import { TYPES } from "../data/demo";
import { typeLabel } from "../lib/listings";

type Values = { name: string; email: string; phone: string; address: string; property_type: string; beds: string; message: string };
interface Result {
  id: number;
  message: string;
}

const SCHEMA = {
  name: [rules.name],
  email: [rules.email],
  phone: [rules.phone],
  address: [rules.minLength("Die Adresse", 5), rules.safeText],
  beds: [rules.number("Die Zahl der Schlafzimmer", 0, 20)],
  message: [rules.safeText],
};

const STEPS = [
  { title: "Bewertung", text: "Eine datenbasierte Preiseinschätzung durch einen lokalen Experten – innerhalb von 48 Stunden." },
  { title: "Präsentation", text: "Architekturfotografie, Film, Grundrisse und eine eigene Geschichte für Ihre Immobilie." },
  { title: "Diskreter Marktstart", text: "Exklusive Vorab-Präsentation für unser Netzwerk geprüfter Käufer, noch vor der öffentlichen Vermarktung." },
  { title: "Verhandlung", text: "Souveräne, gut vorbereitete Verhandlungen bis zum sicheren Notartermin." },
];

const EMPTY: Values = { name: "", email: "", phone: "", address: "", property_type: "house", beds: "3", message: "" };

export default function Sell() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors<Values>>({});
  const { status, result, submit, reset } = useSubmit<object, Result>("/api/valuations");
  const toast = useToast();

  const set = (key: keyof Values) => (e: { target: { value: string } }) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(values, SCHEMA);
    setErrors(found);
    if (Object.keys(found).length) {
      toast("error", "Bitte prüfen Sie die markierten Felder.");
      return;
    }
    const data = await submit({ ...values, beds: Number(values.beds) });
    if (data) toast("success", data.message);
    else toast("error", "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder rufen Sie uns an.");
  }

  function startOver() {
    setValues(EMPTY);
    reset();
  }

  return (
    <>
      <PageHeader eyebrow="Verkaufen mit Skyline" title="Die kostenfreie Bewertung Ihrer Immobilie" lead="Diskret, datenbasiert und innerhalb von 48 Stunden – von einem Berater, der jede Woche in Ihrer Nachbarschaft verkauft." />
      <section className="section">
        <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <Reveal>
              <h2 className="text-4xl">So verkaufen wir</h2>
            </Reveal>
            <ol className="mt-10 space-y-8">
              {STEPS.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.06}>
                  <li className="flex gap-6 border-b border-line pb-8">
                    <span className="font-serif text-4xl text-gold">0{i + 1}</span>
                    <div>
                      <h3 className="text-2xl">{s.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-stone">{s.text}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
            <img src="/images/interior-3.jpg" alt="Gestaltetes Wohnzimmer, bereit für die Verkaufsfotografie" loading="lazy" className="mt-10 aspect-[16/10] w-full object-cover" />
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            {status === "success" && result ? (
              <div className="card p-10 text-center" role="status">
                <CheckCircle2 className="mx-auto size-14 text-gold" aria-hidden />
                <h2 className="mt-5 text-4xl">Anfrage erhalten</h2>
                <p className="mt-3 text-stone">{result.message}</p>
                <p className="mt-2 text-xs text-stone">Referenznummer SKY-{String(result.id).padStart(5, "0")}</p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link to="/listings" className="btn-outline">Immobilien ansehen</Link>
                  <button type="button" onClick={startOver} className="btn-primary">Neue Anfrage</button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="card grid gap-5 p-6 sm:grid-cols-2 sm:p-10" aria-labelledby="valuation-title">
                <div className="sm:col-span-2">
                  <h2 id="valuation-title" className="text-3xl">Erzählen Sie uns von Ihrer Immobilie</h2>
                  <p className="mt-1 text-sm text-stone">Ihre Angaben werden selbstverständlich streng vertraulich behandelt.</p>
                </div>
                <div className="sm:col-span-2">
                  <TextField label="Adresse der Immobilie" name="address" autoComplete="street-address" maxLength={160} value={values.address} onChange={set("address")} error={errors.address} placeholder="Straße, Hausnummer, Ort" />
                </div>
                <SelectField label="Objektart" name="property_type" value={values.property_type} onChange={set("property_type")}>
                  {TYPES.map((t) => <option key={t} value={t}>{typeLabel(t)}</option>)}
                </SelectField>
                <TextField label="Schlafzimmer" name="beds" type="number" inputMode="numeric" min={0} max={20} value={values.beds} onChange={set("beds")} error={errors.beds} />
                <div className="sm:col-span-2">
                  <TextField label="Vollständiger Name" name="name" autoComplete="name" maxLength={80} value={values.name} onChange={set("name")} error={errors.name} />
                </div>
                <TextField label="E-Mail" name="email" type="email" autoComplete="email" maxLength={120} value={values.email} onChange={set("email")} error={errors.email} />
                <TextField label="Telefon" name="phone" type="tel" autoComplete="tel" maxLength={20} value={values.phone} onChange={set("phone")} error={errors.phone} />
                <div className="sm:col-span-2">
                  <TextArea label="Was sollten wir noch wissen? (optional)" name="message" maxLength={1000} value={values.message} onChange={set("message")} error={errors.message} />
                </div>
                <button type="submit" className="btn-primary sm:col-span-2" disabled={status === "submitting"}>
                  {status === "submitting" ? <><Loader2 className="size-4 animate-spin" aria-hidden /> Wird gesendet</> : "Bewertung anfordern"}
                </button>
                <p className="text-center text-xs text-stone sm:col-span-2">Demo-Formular: Die Daten werden nur in der lokalen Demo-Datenbank gespeichert.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
