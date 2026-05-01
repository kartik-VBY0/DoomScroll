export default function ReelCard({ reel }) {
  return <article>{reel?.title || "Reel Card"}</article>;
}
