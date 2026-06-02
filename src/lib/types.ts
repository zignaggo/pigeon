export type DiscoveredPeer = {
  id: string;
  nick: string;
  ip: string;
  port: number;
  mac: string;
  platform: string;
};

export type HistoryDirection = "out" | "in";

export type HistoryStatus = "receiving" | "done";

export type HistoryItem = {
  id?: number;
  dir: HistoryDirection;
  name: string;
  ext: string;
  peer: string;
  time: string;
  size: string;
  status: HistoryStatus;
};

export type HistoryGroup = { day: string; items: HistoryItem[] };

export type LogEntry = { id: number; ts: string; text: string };
export type Progress = { sent: number; total: number };

// Objeto opaco (FileUri do plugin android-fs) — só trafega serializado de volta
// pro backend; o frontend não inspeciona seu conteúdo.
export type SafDir = Record<string, unknown>;

export type ReceiveStartedPayload = {
  name: string;
  size: number;
  from: string;
};
export type ReceiveDonePayload = { path: string };
export type SendProgressPayload = { bytes_sent: number; total: number };
export type SendDonePayload = { name: string; target: string };
export type ErrorPayload = { message: string };

export type PigeonContextValue = {
  localIp: string;
  saveDir: string;
  setSaveDir: (value: string) => void;
  serverRunning: boolean;
  targetIp: string;
  setTargetIp: (value: string) => void;
  filePath: string;
  setFilePath: (value: string) => void;
  sending: boolean;
  progress: Progress | null;
  logs: LogEntry[];
  safDirName: string | null;
  toggleServer: () => Promise<void>;
  pickDir: () => Promise<void>;
  pickSafDir: () => Promise<void>;
  pickFile: () => Promise<void>;
  send: () => Promise<void>;
};
