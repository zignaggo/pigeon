import { PigeonProvider } from "../context/PigeonContext";
import { Header } from "../components/Header";
import { IpBar } from "../components/IpBar";
import { ReceivePanel } from "../components/ReceivePanel";
import { SendPanel } from "../components/SendPanel";
import { StatusLog } from "../components/StatusLog";

export default function Home() {
  return (
    <PigeonProvider>
      <main className="bg-background flex min-h-screen justify-center py-6">
        <div className="rise-in flex w-full max-w-135 flex-col gap-[18px] rounded-[20px] p-6">
          <Header />
          <IpBar />
          <ReceivePanel />
          <SendPanel />
          <StatusLog />
        </div>
      </main>
    </PigeonProvider>
  );
}
