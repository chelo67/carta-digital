import { Button } from '@/components/ui/button';

export default function NoAccess() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">
          No tenés una carta digital activa
        </h1>

        <p className="text-muted-foreground">
          Para acceder al panel de tu menú digital necesitás comprar el cartel
          con carta digital.
        </p>

        <Button
          onClick={() =>
            window.location.href =
              'https://TU-TIENDA.com/producto/cartel-carta-digital'
          }
        >
          Comprar carta digital
        </Button>
      </div>
    </div>
  );
}