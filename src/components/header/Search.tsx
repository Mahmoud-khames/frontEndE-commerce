
"use client";

import { Search } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useAppDispatch } from '@/redux/hooks';
import { searchProducts } from '@/redux/features/prodect/prodectSlice';

export default function SearchInput({search}:{search:string}) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { locale } = useParams();
  const dispatch = useAppDispatch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to products page with search parameter
      router.push(`/${locale}/products?search=${encodeURIComponent(searchTerm.trim())}`);
      
      // No need to dispatch here as SearchParamsHandler will handle it
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center justify-between w-full h-[38px] bg-[#F5F5F5] rounded-md overflow-hidden ">
      <input
        type="text"
        placeholder={search}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full text-gray-900 text-xs sm:text-sm rounded-lg focus:outline-none block px-4 py-1 bg-transparent"
      />
      <button type="submit" className="flex items-center justify-center flex-shrink-0 p-3">
        <Search color='black' className='w-4 h-4 sm:w-5 sm:h-5 cursor-pointer' />
      </button>
    </form>
  );
}
