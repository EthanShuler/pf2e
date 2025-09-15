import { DiceRoller } from './components/DiceRoller/DiceRoller';
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>Pathfinder 2e Game Manager</h1>
        <p className={styles.subtitle}>Roll dice, manage your game, and track your adventures</p>
        
        <DiceRoller />
      </main>
    </div>
  );
}
