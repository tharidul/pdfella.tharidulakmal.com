import { HiArrowRight, HiArrowPath } from "react-icons/hi2";

interface PrimaryActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  label: string;
  loadingLabel: string;
}

export function PrimaryActionButton({
  onClick,
  disabled = false,
  loading = false,
  label,
  loadingLabel,
}: PrimaryActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
    >
      {loading ? (
        <>
          <HiArrowPath className="w-4 h-4 animate-spin" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <HiArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}
