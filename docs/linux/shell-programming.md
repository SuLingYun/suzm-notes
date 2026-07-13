---
title: Shell 编程实战
description: Shell 脚本编程从入门到精通，包括变量、条件判断、循环、函数、正则表达式等
date: 2026-07-09
tags:
  - Shell
  - 脚本编程
  - Linux
---

# Shell 编程实战

## 一、基础语法

### 1.1 变量

```bash
# 定义变量
name="小弥渡"
age=30
readonly PI=3.14159

# 使用变量
echo "姓名: $name"
echo "年龄: ${age}岁"

# 环境变量
export PATH=$PATH:/opt/bin
```

### 1.2 条件判断

```bash
# 文件测试
if [ -f "/etc/passwd" ]; then
    echo "文件存在"
elif [ -d "/etc" ]; then
    echo "目录存在"
else
    echo "不存在"
fi

# 字符串比较
if [ "$str1" = "$str2" ]; then
    echo "相等"
fi

# 数值比较
if [ $num1 -gt $num2 ]; then
    echo "num1 > num2"
fi
```

### 1.3 循环

```bash
# for 循环
for i in {1..10}; do
    echo "数字: $i"
done

# while 循环
count=1
while [ $count -le 5 ]; do
    echo "计数: $count"
    count=$((count + 1))
done

# until 循环
until [ $count -gt 10 ]; do
    echo "until: $count"
    count=$((count + 1))
done
```

## 二、函数

```bash
# 定义函数
hello() {
    echo "Hello, $1!"
    return 0
}

# 调用函数
hello "World"

# 带返回值的函数
add() {
    result=$(( $1 + $2 ))
    echo $result
}

sum=$(add 10 20)
echo "和: $sum"

# 参数处理
print_args() {
    echo "脚本名: $0"
    echo "参数1: $1"
    echo "参数2: $2"
    echo "参数总数: $#"
    echo "所有参数: $*"
}
```

## 三、正则表达式

```bash
# grep 使用正则
grep -E "^[a-zA-Z]" file.txt
grep -E "[0-9]{3,4}-[0-9]{7,8}" phone.txt

# sed 使用正则
sed -i 's/old/new/g' file.txt
sed '/^#/d' file.txt

# awk 使用正则
awk '/error/ {print $0}' log.txt
awk '$3 ~ /^[0-9]+$/ {sum += $3} END {print sum}' data.txt
```

## 四、高级技巧

```bash
# 数组
fruits=("apple" "banana" "orange")
echo "第一个: ${fruits[0]}"
echo "所有: ${fruits[@]}"
echo "长度: ${#fruits[@]}"

# 命令替换
current_dir=$(pwd)
files=`ls -l`

# 进程替换
diff <(sort file1.txt) <(sort file2.txt)

# 陷阱
cleanup() {
    echo "清理临时文件..."
    rm -rf /tmp/temp.*
}
trap cleanup EXIT

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'
echo -e "${RED}错误${NC}"
echo -e "${GREEN}成功${NC}"
```

> 提示：所有文章内容均为实战经验总结，部分示例来自官方文档和社区最佳实践。


---


---


---


---
