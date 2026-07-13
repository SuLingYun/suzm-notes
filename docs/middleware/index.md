# 中间件运维笔记

> 本索引页汇总了中间件相关的运维笔记，涵盖 Nginx、Tomcat 等常用中间件的安装部署、配置优化、性能调优及故障处理等实践内容。

---

## 文章列表

| 文章 | 描述 | 最后更新 |
|------|------|----------|
| [Nginx 配置指南](./nginx.md) | Nginx 反向代理、负载均衡、HTTPS 配置与缓存策略 | 2026-07-08 |
| [Tomcat 部署与优化](./tomcat.md) | Tomcat 安装部署、JVM 调优、连接器配置与性能监控 | 2026-07-08 |

---

## 中间件运维要点

### Nginx 运维要点

- **配置检查**：修改配置后务必使用 `nginx -t` 检查语法
- **优雅重载**：使用 `nginx -s reload` 实现配置热加载
- **日志切割**：定期切割 access_log 和 error_log，避免磁盘占满
- **连接数监控**：关注 `active connections` 和 `waiting` 状态
- **SSL 证书管理**：证书到期前及时更新，建议使用 Let's Encrypt 自动续期
- **安全加固**：禁用不安全的 TLS 版本，配置合理的 CORS 和 CSP 策略

### Tomcat 运维要点

- **JVM 参数调优**：根据应用需求合理配置堆内存和 GC 策略
- **连接器配置**：根据并发量调整 maxThreads、acceptCount 等参数
- **部署管理**：使用 Manager App 管理应用部署生命周期
- **日志管理**：配置 catalina.out 日志轮转，避免单文件过大
- **安全配置**：移除默认示例应用，配置管理员密码
- **定期监控**：通过 JMX 或结合 Prometheus + Grafana 监控 Tomcat 状态

---

## 端口速查表

| 中间件 | 默认端口 | 说明 |
|--------|----------|------|
| Nginx HTTP | 80 | HTTP 默认端口 |
| Nginx HTTPS | 443 | HTTPS 默认端口 |
| Tomcat HTTP | 8080 | Tomcat 默认 HTTP 连接器 |
| Tomcat HTTPS | 8443 | Tomcat 默认 HTTPS 连接器 |
| Tomcat AJP | 8009 | AJP 连接器（与 Apache/Nginx 配合） |
| Tomcat Shutdown | 8005 | Tomcat 关闭端口 |

---

> **参考文档**：[Nginx 配置指南](./nginx.md) | [Tomcat 部署与优化](./tomcat.md)