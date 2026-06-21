export default function SectionHeading({ title, body }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
      {body ? <p className="mt-3 max-w-2xl text-base text-slate-600">{body}</p> : null}
    </div>
  );
}
