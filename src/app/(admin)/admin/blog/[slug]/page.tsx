import { notFound } from "next/navigation";
import { getPost } from "@/lib/data";
import PostEditor from "./PostEditor";

type Props = { params: Promise<{ slug: string }> };

export default async function PostEditorPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return <PostEditor initial={post} />;
}
