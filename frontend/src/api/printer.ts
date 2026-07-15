const PRINTER_SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb';
const PRINTER_CHARACTERISTIC_UUID = '00002af1-0000-1000-8000-00805f9b34fb';

const ESC = 0x1b;
const GS = 0x1d;

export class ReceiptBuilder {
  private bytes: number[] = [];

  init() {
    this.bytes.push(ESC, 0x40);
    return this;
  }

  center() {
    this.bytes.push(ESC, 0x61, 0x01);
    return this;
  }

  left() {
    this.bytes.push(ESC, 0x61, 0x00);
    return this;
  }

  bold(on: boolean) {
    this.bytes.push(ESC, 0x45, on ? 0x01 : 0x00);
    return this;
  }

  doubleSize(on: boolean) {
    this.bytes.push(GS, 0x21, on ? 0x11 : 0x00);
    return this;
  }

  text(str: string) {
    this.bytes.push(...Array.from(new TextEncoder().encode(str)));
    return this;
  }

  newline(count = 1) {
    for (let i = 0; i < count; i++) this.bytes.push(0x0a);
    return this;
  }

  divider(length = 32) {
    this.text('-'.repeat(length));
    this.newline();
    return this;
  }

  cut() {
    this.newline(3);
    this.bytes.push(GS, 0x56, 0x00);
    return this;
  }

  build(): Uint8Array {
    return new Uint8Array(this.bytes);
  }
}

let device: BluetoothDevice | null = null;
let characteristic: BluetoothRemoteGATTCharacteristic | null = null;

export async function connectPrinter(): Promise<void> {
  if (!navigator.bluetooth) {
    throw new Error('Bluetooth is not supported on this browser/device.');
  }
  device = await navigator.bluetooth.requestDevice({
    filters: [{ services: [PRINTER_SERVICE_UUID] }],
    optionalServices: [PRINTER_SERVICE_UUID],
  });
  const server = await device.gatt?.connect();
  const service = await server?.getPrimaryService(PRINTER_SERVICE_UUID);
  const char = await service?.getCharacteristic(PRINTER_CHARACTERISTIC_UUID);
  characteristic = char ?? null;
}

export function isPrinterConnected(): boolean {
  return characteristic !== null && device?.gatt?.connected === true;
}

export async function sendToPrinter(data: Uint8Array): Promise<void> {
  if (!characteristic) {
    throw new Error('Printer not connected.');
  }
  const CHUNK_SIZE = 100;
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    await characteristic.writeValue(chunk);
  }
}