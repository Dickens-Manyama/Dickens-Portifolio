export const metadata = {
  title: "Admin | Dickens Manyama",
  description: "Portfolio admin panel",
};

export default function AdminLayout({ children }) {
  return <div className="min-h-screen bg-slate-950 text-white">{children}</div>;
}
