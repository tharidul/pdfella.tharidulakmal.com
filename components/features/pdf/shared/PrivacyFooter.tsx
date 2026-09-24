interface PrivacyFooterProps {
  action?: string;
}

export function PrivacyFooter({ action = "processing" }: PrivacyFooterProps) {
  return (
    <p className="text-xs text-neutral-600 text-center leading-relaxed">
      All {action} executes locally in your browser.
    </p>
  );
}
