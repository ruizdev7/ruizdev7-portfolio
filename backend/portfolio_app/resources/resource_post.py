import os
import base64
from datetime import datetime

from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required
from flask import jsonify, request, Blueprint, make_response, send_from_directory

from portfolio_app import db
from portfolio_app.models.tbl_post import Post
from portfolio_app.models.tbl_user import User
from portfolio_app.schemas.schema_posts import SchemaPost

blueprint_api_post = Blueprint("api_post", __name__, url_prefix="")


# Helper function for serialization
def serialize_query(query_result, schema, many=False):
    schema_instance = schema(many=many)
    return schema_instance.dump(query_result)


@blueprint_api_post.route("api/v1/posts", methods=["POST"])
def create_post():
    """Create a new post"""
    request_data = request.get_json()

    new_post = Post(
        title=request_data["title"],
        content=request_data["content"],
        ccn_author=request_data["ccn_author"],
        ccn_category=request_data["ccn_category"],
    )

    db.session.add(new_post)
    db.session.commit()

    schema_post = SchemaPost(many=False)
    post = schema_post.dump(new_post)

    return make_response(
        jsonify(
            {
                "New Post": post,
                "msg": "The post has been created successfully",
            }
        ),
        201,
    )


@blueprint_api_post.route("/api/v1/posts/<int:ccn_post>", methods=["GET"])
def get_post(ccn_post):
    query_post = Post.query.filter_by(ccn_post=ccn_post).first()
    schema_post = SchemaPost(many=False)
    post = schema_post.dump(query_post)
    return make_response(jsonify({"Post": post}), 200)


@blueprint_api_post.route("/api/v1/posts", methods=["GET"])
def get_all_posts():
    """Retrieve all posts"""
    all_posts = Post.query.all()
    posts = serialize_query(all_posts, SchemaPost, many=True)
    return make_response(jsonify({"Posts": posts}), 200)  # 200 OK


@blueprint_api_post.route("api/v1/posts/featured", methods=["GET"])
def get_featured_post():
    """Retrieve the most recent featured post"""
    featured_post = Post.query.order_by(Post.ccn_post.desc()).first()

    if not featured_post:
        return jsonify({"error": "No featured posts available"}), 404

    if featured_post:
        schema_post = SchemaPost(many=False)
        post = schema_post.dump(featured_post)
        return make_response(jsonify({"FeaturedPost": post}), 200)
    else:
        return jsonify({"error": "No featured posts available"}), 404
