interface FooterProps {
  loadError?: string | null;
}

export default function Footer({ loadError }: FooterProps) {
  return (
    <footer className="mt-15 px-6 pb-10">
      {loadError && (
        <p className="text-center text-[0.7rem] text-amber-600 dark:text-amber-400 mb-3">
          {loadError}
        </p>
      )}
      <div className="h-[0.5px] bg-[rgba(167,161,159,1)] mb-5" />
      <p className="text-center text-[0.72rem] text-[var(--color-stone-400)] tracking-wider leading-tight">
        &copy; {new Date().getFullYear()} BlogMe &mdash; A personal writing
        space.
      </p>
    </footer>
  );
}
