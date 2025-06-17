import Link from 'next/link';
import style from './admin.module.css';

export default function AdminLayout({ children }) {
  return (
    <div className={style.AdminLayout}>
      <div className={style.header}>
        <h1>관리자 페이지에 오신 것을 환영합니다.</h1>
        <nav className={style.navLinks}>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/upload">Upload Files</Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
