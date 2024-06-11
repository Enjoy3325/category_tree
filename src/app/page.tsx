import { CategoryTree } from "../components/CategoryTree/CategoryTree";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <CategoryTree />
    </main>
  );
}
