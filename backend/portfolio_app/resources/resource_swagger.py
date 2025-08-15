from flask import Blueprint, send_from_directory, jsonify
import os

blueprint_api_swagger = Blueprint("api_swagger", __name__, url_prefix="")


@blueprint_api_swagger.route("/api/v1/swagger.json", methods=["GET"])
def get_swagger_json():
    """Sirve el archivo swagger.json para la documentación de la API"""
    try:
        # Ruta correcta para el archivo swagger.json
        swagger_path = os.path.join("portfolio_app", "static", "swagger.json")
        static_dir = os.path.join(os.getcwd(), "portfolio_app", "static")

        return send_from_directory(
            static_dir,
            "swagger.json",
            mimetype="application/json",
        )
    except Exception as e:
        return jsonify({"error": f"Error al cargar la documentación: {str(e)}"}), 500


@blueprint_api_swagger.route("/api/v1/docs", methods=["GET"])
def get_swagger_ui():
    """Sirve la interfaz de Swagger UI para la documentación"""
    html_content = """
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Portfolio RuizDev7 API - Documentación</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
        <style>
            html {
                box-sizing: border-box;
                overflow: -moz-scrollbars-vertical;
                overflow-y: scroll;
            }
            *, *:before, *:after {
                box-sizing: inherit;
            }
            body {
                margin:0;
                background: #fafafa;
            }
        </style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
        <script>
            window.onload = function() {
                const ui = SwaggerUIBundle({
                    url: '/api/v1/swagger.json',
                    dom_id: '#swagger-ui',
                    deepLinking: true,
                    presets: [
                        SwaggerUIBundle.presets.apis,
                        SwaggerUIStandalonePreset
                    ],
                    plugins: [
                        SwaggerUIBundle.plugins.DownloadUrl
                    ],
                    layout: "StandaloneLayout",
                    validatorUrl: null,
                    docExpansion: "list",
                    filter: true,
                    showRequestHeaders: true,
                    tryItOutEnabled: true,
                    requestInterceptor: function(request) {
                        // Agregar el token JWT si está disponible
                        const token = localStorage.getItem('jwt_token');
                        if (token) {
                            request.headers['Authorization'] = 'Bearer ' + token;
                        }
                        return request;
                    }
                });
                
                // Función para manejar el login y guardar el token
                window.handleLogin = function(response) {
                    if (response.current_user && response.current_user.token) {
                        localStorage.setItem('jwt_token', response.current_user.token);
                        console.log('Token JWT guardado');
                    }
                };
            };
        </script>
    </body>
    </html>
    """
    return html_content, 200, {"Content-Type": "text/html"}


@blueprint_api_swagger.route("/api/v1/docs/redoc", methods=["GET"])
def get_redoc_ui():
    """Sirve la interfaz de ReDoc para la documentación alternativa"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Portfolio RuizDev7 API - ReDoc</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
        <style>
            body {
                margin: 0;
                padding: 0;
            }
        </style>
    </head>
    <body>
        <redoc spec-url='/api/v1/swagger.json'></redoc>
        <script src="https://cdn.jsdelivr.net/npm/redoc@2.0.0/bundles/redoc.standalone.js"></script>
    </body>
    </html>
    """
    return html_content, 200, {"Content-Type": "text/html"}
