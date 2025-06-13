"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blog = void 0;
const typeorm_1 = require("typeorm");
const comment_entity_1 = require("./comment.entity");
let Blog = class Blog {
    id;
    name;
    content;
    excerpt;
    category;
    tags;
    image;
    image_url;
    featured;
    canEdit;
    readTime;
    created_at;
    updated_at;
    comments;
};
exports.Blog = Blog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Blog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Blog.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Blog.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Blog.prototype, "excerpt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Blog.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true, nullable: true }),
    __metadata("design:type", Array)
], Blog.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 'No' }),
    __metadata("design:type", String)
], Blog.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Blog.prototype, "image_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'featured', nullable: true, default: false }),
    __metadata("design:type", Boolean)
], Blog.prototype, "featured", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'canedit', nullable: true, default: true }),
    __metadata("design:type", Boolean)
], Blog.prototype, "canEdit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'readtime', nullable: true, default: 5 }),
    __metadata("design:type", Number)
], Blog.prototype, "readTime", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Blog.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Blog.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => comment_entity_1.Comment, comment => comment.blog),
    __metadata("design:type", Array)
], Blog.prototype, "comments", void 0);
exports.Blog = Blog = __decorate([
    (0, typeorm_1.Entity)('blog_posts')
], Blog);
//# sourceMappingURL=blog.entity.js.map