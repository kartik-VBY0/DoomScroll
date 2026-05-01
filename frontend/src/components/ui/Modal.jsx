export default function Modal({ isOpen, children }) {
  if (!isOpen) return null;

  return <div>{children}</div>;
}
