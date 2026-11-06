# CORTE STUDIO · Angular + API Express

## Frontend

    npm install
    npm start        # http://localhost:4200

- Marca y textos: `src/app/core/brand.ts`
- Servicios, barberos y horarios visibles: `src/app/core/demo-data.ts`
- Tokens de diseño: bloque `:root` de `src/styles.css`
- Fotos reales: pasa `[src]="'assets/...'"` a `<app-photo>` (archivos en `public/`)
- Rutas: `/`, `/reservar`, `/ingresar`.

## API

La interfaz consume `http://localhost:3000/api` por defecto. Si despliegas el backend en otra dirección, actualiza `API_BASE_URL` en `src/app/core/barberia-api.ts`.

1. Crea una base de datos en MongoDB y configura `MONGO_URI` y `JWT_SECRET` en `barberia-backend-main/.env`, tomando `barberia-backend-main/.env.example` como referencia. No compartas ni subas el archivo `.env`.
2. En una terminal:

       cd barberia-backend-main
       npm install
       npm start

3. En otra terminal, desde la raíz del proyecto:

       npm start

El backend debe estar activo en el puerto 3000 antes de reservar o iniciar sesión. La API guarda nombre, servicio, barbero, fecha y hora de cada cita; no recoge ni almacena el teléfono. La disponibilidad se consulta por barbero y fecha, devolviendo solo horas ocupadas. El inicio de sesión guarda el token durante la sesión del navegador.
