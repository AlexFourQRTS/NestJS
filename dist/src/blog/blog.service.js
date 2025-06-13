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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const blog_entity_1 = require("./entities/blog.entity");
let BlogService = class BlogService {
    blogRepository;
    constructor(blogRepository) {
        this.blogRepository = blogRepository;
    }
    async findAll(query) {
        const { search, category, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.name = (0, typeorm_2.ILike)(`%${search}%`);
        }
        if (category && category !== 'all') {
            where.category = category;
        }
        const [blogs, total] = await Promise.all([
            this.blogRepository.find({
                where,
                skip,
                take: limit,
                order: { created_at: 'DESC' },
            }),
            this.blogRepository.count({ where }),
        ]);
        return {
            articles: blogs,
            totalCount: total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const blog = await this.blogRepository.findOne({
            where: { id },
        });
        if (!blog) {
            throw new common_1.NotFoundException('Blog not found');
        }
        return blog;
    }
    async create(createBlogDto) {
        const blog = this.blogRepository.create({
            ...createBlogDto,
            image: createBlogDto.image || 'No',
            featured: createBlogDto.featured || false,
            canEdit: createBlogDto.canEdit ?? true,
            readTime: createBlogDto.readTime || 5,
        });
        return this.blogRepository.save(blog);
    }
    async update(id, updateBlogDto) {
        const blog = await this.blogRepository.findOne({
            where: { id },
        });
        if (!blog) {
            throw new common_1.NotFoundException('Blog not found');
        }
        Object.assign(blog, updateBlogDto);
        return this.blogRepository.save(blog);
    }
    async remove(id) {
        const blog = await this.blogRepository.findOne({
            where: { id },
        });
        if (!blog) {
            throw new common_1.NotFoundException('Blog not found');
        }
        await this.blogRepository.remove(blog);
        return { success: true };
    }
};
exports.BlogService = BlogService;
exports.BlogService = BlogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(blog_entity_1.Blog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BlogService);
//# sourceMappingURL=blog.service.js.map