import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-slate-950/90 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-slate-100 group-[.toaster]:border-slate-800 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-slate-400 text-xs",
          actionButton: "group-[.toast]:bg-amber-500 group-[.toast]:text-slate-950 font-semibold text-xs px-3 py-1.5 rounded-lg",
          cancelButton: "group-[.toast]:bg-slate-800 group-[.toast]:text-slate-300 text-xs px-3 py-1.5 rounded-lg",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
