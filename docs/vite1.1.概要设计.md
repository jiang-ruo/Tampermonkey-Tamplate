
# Tampermonkey-Tamplate - 添加编译时间

版本: v1.1

日期: 2025.10.26

## 引言

### 背景与目的

方便观察main.js是否更新

## 模块设计
### 1. 添加编译时间

#### 功能

1. headerPlugin中添加一个开关{ addExportTime: boolean }，默认关闭
2. addExportTime为true时，在导出的脚本中添加编译时间
