import os
import base64
from datetime import datetime

from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required
from flask import jsonify, request, Blueprint, make_response, send_from_directory

from portfolio_app import db
from portfolio_app.models.tbl_posts import Post
from portfolio_app.models.tbl_users import User
from portfolio_app.models.tbl_categories import Category
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
    """Get all posts with author full name and category name"""
    posts = Post.query.all()
    result = []
    for post in posts:
        author = User.query.filter_by(ccn_user=post.ccn_author).first()
        category = Category.query.filter_by(ccn_category=post.ccn_category).first()
        post_data = {
            "ccn_post": post.ccn_post,
            "title": post.title,
            "content": post.content,
            "author_full_name": f"{author.first_name} {author.last_name}",
            "category_name": category.category,
            "published_at": post.published_at,
        }
        result.append(post_data)
    return make_response(jsonify({"Posts": result}), 200)


@blueprint_api_post.route("/api/v1/posts/featured_post", methods=["GET"])
def get_featured_post():
    """Get the featured post, which is the last post"""
    post = Post.query.order_by(Post.ccn_post.desc()).first()
    print(post)
    if post:
        author = User.query.filter_by(ccn_user=post.ccn_author).first()
        category = Category.query.filter_by(ccn_category=post.ccn_category).first()
        post_data = {
            "ccn_post": post.ccn_post,
            "title": post.title,
            "content": post.content,
            "author_full_name": f"{author.first_name} {author.last_name}",
            "category_name": category.category,
            "published_at": post.published_at,
        }
        return make_response(jsonify({"FeaturedPost": post_data}), 200)
    else:
        return make_response(jsonify({"msg": "No posts available"}), 404)
