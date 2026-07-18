"use client";

// Uppercase section header: sticky with a blurred backdrop on mobile,
// a plain static heading on desktop.
export default function SectionHeading({ label }) {
  return (
    <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:static lg:mx-0 lg:mb-8 lg:w-full lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200">{label}</h2>
    </div>
  );
}
