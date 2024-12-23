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
    query_posts = (
        db.session.query(Post, User).join(User, Post.ccn_author == User.ccn_user).all()
    )
    posts = []
    for post, author in query_posts:
        post_schema = SchemaPost(many=False)
        post_data = post_schema.dump(post)
        full_name_author = f"{author.first_name or ''} {author.last_name or ''}".strip()
        category = post.category if post.category else None
        post_data["author"] = full_name_author
        post_data["category"] = category.category if category else None
        posts.append(post_data)
    return make_response(jsonify({"Posts": posts}), 200)


@blueprint_api_post.route("api/v1/posts/featured", methods=["GET"])
def get_featured_post():
    """Retrieve the most recent featured post"""
    featured_post = Post.query.order_by(Post.ccn_post.desc()).first()

    if not featured_post:
        return jsonify({"error": "No featured posts available"}), 404

    else:
        author = User.query.filter_by(ccn_user=featured_post.ccn_author).first()
        full_name_author = f"{author.first_name or ''} {author.last_name or ''}".strip()
        category = featured_post.category if featured_post.category else None
        return (
            jsonify(
                {
                    "FeaturedPost": {
                        "title": featured_post.title,
                        "content": featured_post.content,
                        "author": full_name_author,
                        "published_at": featured_post.published_at,
                        "category": (
                            category.category
                            if category and hasattr(category, "category")
                            else None
                        ),
                    }
                }
            ),
            200,
        )
