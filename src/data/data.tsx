import { Pages, Routes } from "@/constants/enums";
import { Home, Monitor, Phone, Package, Users   } from "lucide-react";
import { Camera, Headphones, Watch } from "lucide-react";
import { Gamepad } from "lucide-react";
import { 
  LayoutDashboard, 
  ShoppingBag, 

  Tag, 
  Settings, 
  BarChart 
} from "lucide-react";

export const navBar = [
  // {
  //   id: 1,
  //   title: Pages.HOME,
  //   url: Routes.ROOT,
  // },
  {
    id: 2,
    title: Pages.CONTACT,
    url: Routes.CONTACT,
  },
  {
    id: 3,
    title: Pages.ABOUT,
    url: Routes.ABOUT,
  },

  {
    id: 4,
    title: Pages.REGISTER,
    url: Routes.REGISTER,
  },
];

export const FilterData = [
  {
    id: 1,
      title: `Woman's Fashion`,
  },
  {
    id: 2,
    title: "Men's Fashion",
  },
  {
    id: 3,
    title: "Electronics",
  },
  {
    id: 4,
    title: "Home & Lifestyle",
  },
  {
    id: 5,
    title: "Medicine",
  },
  {
    id: 6,
    title: "Sports & Outdoor",
  },
  {
    id: 7,
    title: "Baby's & Toys",
  },
  {
    id: 8,
    title: "Groceries & Pets",
  },
  {
    id: 9,
    title: "Health & Beauty",
  },
];


export const Categories = [
  {
    id: 1,
    icon: <Phone className="w-10 h-10" strokeWidth={1} />,
    name: "Phones",
  },
  {
    id: 2,
    icon: <Monitor className="w-10 h-10" strokeWidth={1} />,
    name: "Computers",
  },
  {
    id: 3,
    icon: <Watch className="w-10 h-10" strokeWidth={1} />,
    name: "SmartWatch",
  },
  {
    id: 4,
    icon: <Camera className="w-10 h-10" strokeWidth={1} />,
    name: "Camera",
  },
  {
    id: 5,
    icon: <Headphones className="w-10 h-10" strokeWidth={1} />,
    name: "HeadPhones",
  },
  {
    id: 6,
    icon: <Gamepad className="w-10 h-10" strokeWidth={1} />,
    name: "Gaming",
  },
];

export const AdminDashboard = [
  {
    id: 1,
    name: "Dashboard",
    url: Routes.ADMIN_DASHBOARD,
    icon: <LayoutDashboard className="h-5 w-5" />,
    nameAr: "لوحة التحكم"
  },
  {
    id: 2,
    name: "Products",
    url: Routes.ADMIN_PRODUCTS,
    icon: <ShoppingBag className="h-5 w-5" />,
    nameAr: "المنتجات"
  },
  {
    id: 3,
    name: "Categories",
    url: Routes.ADMIN_CATEGORIES,
    icon: <Package className="h-5 w-5" />,
    nameAr: "التصنيفات"
  },
  {
    id: 4,
    name: "Orders",
    url: Routes.ADMIN_ORDERS,
    icon: <BarChart className="h-5 w-5" />,
    nameAr: "الطلبات"
  },
  {
    id: 5,
    name: "Coupons",
    url: Routes.ADMIN_COUPONS,
    icon: <Tag className="h-5 w-5" />,
    nameAr: "الكوبونات"
  },
  {
    id: 6,
    name: "Users",
    url: Routes.ADMIN_USERS,
    icon: <Users className="h-5 w-5" />,
    nameAr: "المستخدمين"
  },
{
  id:7,
  name: "Customize",
    url: Routes.ADMIN_CUSTOMIZE,
    icon: <Settings className="h-5 w-5" />,
    nameAr: "تخصيص"
}
];  


