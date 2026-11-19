import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="grid min-h-[80vh] place-items-center px-4 pt-24 text-center">
      <div>
        <p className="eyebrow justify-center">Fehler 404</p>
        <h1 className="heading mt-5">Diese Adresse ist nicht mehr auf dem Markt</h1>
        <p className="lead mx-auto mt-4 max-w-md">Die gesuchte Seite wurde verschoben oder existiert nicht mehr.</p>
        <Link to="/listings" className="btn-primary mt-10">Immobilien ansehen</Link>
      </div>
    </section>
  );
}
