
import ProductItem from "./_components/ProductItem";
import ProductReviewItem from "./_components/ProductReviewItem";
import { Suspense } from "react";
import Loading from "../../loading";

interface ProductPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  return {
    title: `Product: ${slug}`,
    description: `View details for ${slug}`,
  };
}

async function Page({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen container mx-auto px-3 sm:px-4 py-4">
      <Suspense fallback={<Loading />}>
        <ProductItem slug={slug} />
        <ProductReviewItem slug={slug} />
      </Suspense>
    </div>
  );
}

export default Page;





