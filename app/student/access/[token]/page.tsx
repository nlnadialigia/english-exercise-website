import MagicLinkClient from "./MagicLinkClient";

interface Props {
  params: Promise<{ token: string; }>;
}

export default async function StudentAccessPage({ params }: Props) {
  const { token } = await params;
  
  return <MagicLinkClient token={token} />;
}
