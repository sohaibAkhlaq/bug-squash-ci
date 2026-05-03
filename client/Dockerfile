# Stage 1: Build Angular app
FROM node:24-alpine as build-stage

WORKDIR /app

COPY package*.json ./
# Using legacy-peer-deps to avoid the issues we saw earlier
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve app with Nginx
FROM nginx:stable-alpine

# Copy built files
COPY --from=build-stage /app/dist/bugsquash-ci/browser /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
