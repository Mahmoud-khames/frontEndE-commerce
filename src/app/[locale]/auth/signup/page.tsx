import Image from "next/image";
import Form from "./_components/Form";
import Link from "@/components/link";
import { Routes } from "@/constants/enums";
import getTrans from "@/lib/translation";
import { Locale } from "@/i18n.config";

export default async function Page({
  params,
}: {
  params: { locale: Locale };
}) {
  const locale = params.locale;
  const { t } = await getTrans(locale);
  return (
    <div className="flex flex-col ">
      <div className="flex justify-start items-start gap-2 mt-10">
          <Link href={`/${locale}`} className="text-gray-600 hover:underline">
            {t.navigation.home}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/signup`} className="text-black hover:underline">
            {t.navigation.signup}
          </Link>
        </div>
        <div className="flex items-center justify-between py-10 min-h-screen gap-10">
       
       <div className="flex flex-col lg:flex-row justify-between items-center gap-10 w-full max-w-7xl mx-auto">
         {/* Image Section */}
         <div className="w-full lg:w-2/3 hidden md:block">
           <Image
             src="/imagesing.png"
             alt="Cart with phone and shopping bags"
             width={805}
             height={781}
             className="w-full h-auto object-cover rounded-md"
           />
         </div>
 
         {/* Form Section */}
         <div className="flex flex-col items-start justify-start w-full lg:w-1/3 gap-8">
           {/* Title and Description */}
           <div>
             <h2 className="text-3xl font-bold leading-tight">
               {t.auth.createAccount}
             </h2>
             <p className="text-gray-500 mt-2">{t.auth.enterDetails}</p>
           </div>
 
           {/* Form */}
           <Form locale={locale} t={t} />
 
           {/* Sign up with Google and Log in Link */}
           <div className="flex flex-col items-center gap-4 w-full">
             <p className="text-gray-500 text-sm">
               {t.auth.alreadyHaveAccount}
               <Link
                 href={`/${locale}/${Routes.LOGIN}`}
                 className="text-black underline"
               >
                 {t.auth.login}
               </Link>
             </p>
           </div>
         </div>
       </div>
     </div>
    </div>
  
  );
}
