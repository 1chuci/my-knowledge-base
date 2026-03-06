function main(config) { // 主函数，处理配置文件
    // !!! 机场订阅和SOCKS5节点需要在Clash配置文件的proxies部分预先定义
    // !!! 机场订阅通过proxy-providers或直接在proxies数组中添加
    // !!! SOCKS5节点示例：
    // !!! {
    // !!!   "name": "SOCKS5-落地",
    // !!!   "type": "socks5",
    // !!!   "server": "127.0.0.1",
    // !!!   "port": 1080,
    // !!!   "username": "user",
    // !!!   "password": "pass"
    // !!! }
    
    // 链式代理使用方法：在代理组中设置type为"relay"，proxies数组中的节点会按顺序链式连接
    // 节点名称从config.proxies数组中获取，每个proxy对象都有name属性
    // 机场+SOCKS5示例：proxies: ["🇺🇸 美国01", "SOCKS5-落地"]
    // 前置机场节点，后置SOCKS5落地，需要手动指定具体节点名称
    // 自动获取示例：下面代码会自动取前两个节点，如需指定请手动修改relayProxies数组
    
    // !!! SOCKS5节点示例配置，可直接修改参数
    const socks5Node = {
        name: "猫猫的家宽福利", // !!! 修改节点名称
        type: "socks5",
        server: "23.142.16.59", // !!! 修改服务器地址
        port: 27344, // !!! 修改端口
        username: "l7q2m8d4r9k", // !!! 修改用户名，无需验证可删除此行
        password: "f3c8v2n7t5a" // !!! 修改密码，无需验证可删除此行
    };
    const socks5Node2 = {
        name: "猫猫的家宽盲盒",
        type: "socks5",
        server: "65.195.111.4",
        port: "50101",
        username: "HR0F5N7jN",
        password: "5ee65UXgJ8"
    };
    
    // 将SOCKS5节点添加到配置中
    if (!config.proxies) config.proxies = [];
    config.proxies.push(socks5Node);
    config.proxies.push(socks5Node2);

    
    const proxyGroups = [ // 创建代理组数组
        {
            name: "链式代理", // 代理组名称
            type: "relay", // !!! relay类型实现链式代理，流量会依次经过proxies中的所有节点
            proxies: [] // 链式代理节点列表，将在下面动态填充
        },
        {
            name: "节点选择", // 手动选择代理组
            type: "select", // select类型允许手动选择
            proxies: ["链式代理", "DIRECT"] // 可选择的代理选项
        }
    ];

    if (config.proxies && config.proxies.length > 0) { // 检查是否有可用节点
        const allProxyNames = config.proxies.map(proxy => proxy.name); // 获取所有节点名称
        
        // 动态选择链式代理节点：优先使用包含特定关键词的节点，否则使用前两个
        let relayProxies = [];
        const preferredNode = allProxyNames.find(name => name.includes("日本"));
        const socks5Nodes = allProxyNames.filter(name => 
            config.proxies.find(proxy => proxy.name === name && proxy.type === "socks5")
        );

        if (preferredNode && socks5Nodes.length > 0) {
            relayProxies = [preferredNode, ...socks5Nodes];

        } else if (allProxyNames.length >= 2) {
            // 如果没找到指定节点，使用前两个可用节点
            relayProxies = allProxyNames.slice(0, 2);
        } else {
            // 如果只有一个节点，直接使用
            relayProxies = allProxyNames;
        }
        
        proxyGroups[0].proxies = relayProxies; // 将节点添加到链式代理组
        proxyGroups[1].proxies = ["链式代理", ...allProxyNames, "DIRECT"]; // 添加到选择组
    }

    config["proxy-groups"] = proxyGroups; // 设置代理组配置

    // 简化规则：所有流量走链式代理
    config["rules"] = [
        "MATCH,链式代理" // 所有流量走链式代理
    ];

    return config; // 返回修改后的配置
}