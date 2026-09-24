interface PrivacyFooterProps {
  action?: string;
}

export function PrivacyFooter({ action = "processing" }: PrivacyFooterProps) {
  return (
    <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
      All {action} executes locally in your browser.
    </p>
  );
}
