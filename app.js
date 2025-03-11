// 等待DOM内容加载完毕后执行，确保所有元素都已加载完成
document.addEventListener("DOMContentLoaded", () => {
    // 音乐控制相关元素
    const musicControl = document.getElementById('music-control');  // 音乐控制按钮
    const musicIcon = document.getElementById('music-icon');      // 音乐图标
    const backgroundMusic = document.getElementById('background-music');  // 背景音乐元素
    
    // 音乐播放状态和进度管理
    let isMusicPlaying = true;  // 音乐播放状态标志
    const musicTime = parseFloat(sessionStorage.getItem('musicTime') || '0');  // 从会话存储获取上次播放位置
    
    // 强制自动播放函数
    // 通过先静音播放再取消静音的方式绕过浏览器的自动播放限制
    function forceAutoPlay() {
        backgroundMusic.currentTime = musicTime;  // 设置播放位置
        backgroundMusic.muted = true;  // 先静音以绕过浏览器拦截
        
        backgroundMusic.play().then(() => {
            console.log('静音自动播放成功');
            backgroundMusic.muted = false;  // 播放成功后取消静音
        }).catch(error => {
            console.log('自动播放失败', error);
            enableUserInteractionPlay();  // 失败时启用用户交互触发播放
        });
    }
    
    // 启用用户交互触发播放
    // 监听用户的点击或按键事件来触发音乐播放
    function enableUserInteractionPlay() {
        document.addEventListener('click', forceAutoPlay, { once: true });  // 只触发一次的点击事件
        document.addEventListener('keydown', forceAutoPlay, { once: true }); // 只触发一次的按键事件
    }
    
    // 更新音乐图标显示
    // 根据播放状态切换音乐图标
    function updateMusicIcon() {
        musicIcon.src = isMusicPlaying ? 'images/music.png' : 'images/no-music.png';
    }
    
    // 定时轮询尝试播放
    // 每3秒检查一次音乐是否在播放，如果没有则尝试重新播放
    const retryPlayInterval = setInterval(() => {
        if (!backgroundMusic.paused) {
            clearInterval(retryPlayInterval);  // 播放成功后清除定时器
        } else {
            forceAutoPlay();  // 继续尝试播放
        }
    }, 3000);
    
    // 监听页面可见性变化
    // 当页面重新变为可见时恢复音乐播放
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            forceAutoPlay();  // 页面可见时尝试播放
        }
    });
    
    // 音乐控制按钮点击事件
    // 实现音乐播放/暂停的切换
    musicControl.addEventListener('click', () => {
        isMusicPlaying = !isMusicPlaying;  // 切换播放状态
        isMusicPlaying ? backgroundMusic.play() : backgroundMusic.pause();  // 执行播放或暂停
        updateMusicIcon();  // 更新图标显示
    });
    
    // 定期保存播放进度
    // 每秒将当前播放时间保存到会话存储
    setInterval(() => {
        sessionStorage.setItem('musicTime', backgroundMusic.currentTime.toString());
    }, 1000);
    
    // 页面关闭前保存音乐时间
    // 确保在页面关闭时保存最后的播放位置
    window.addEventListener('beforeunload', () => {
        sessionStorage.setItem('musicTime', backgroundMusic.currentTime.toString());
    });
    
    // 初始尝试自动播放
    forceAutoPlay();
    
    // 页面滚动监听相关元素
    const sections = document.querySelectorAll('.fullscreen-container');  // 全屏容器
    const navLinks = document.querySelectorAll('.nav-link');  // 导航链接
    
    // Intersection Observer配置
    // 用于检测元素的可见性变化
    const observerOptions = {
        root: null,  // 使用视口作为根元素
        rootMargin: '0px',  // 不设置边距
        threshold: 0.6  // 当元素60%可见时触发
    };
    
    // 创建Intersection Observer实例
    // 监听区域可见性并更新导航状态
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');  // 获取可见区域的ID
                // 更新导航链接的激活状态
                navLinks.forEach(link => {
                    if (link.getAttribute('data-section') === id) {
                        link.classList.add('active');  // 当前区域的导航链接添加激活样式
                    } else {
                        link.classList.remove('active');  // 其他导航链接移除激活样式
                    }
                });
            }
        });
    }, observerOptions);
    
    // 为每个区域添加观察器
    sections.forEach(section => {
        observer.observe(section);
    });

    // 互动地图功能（已注释）
    // 当鼠标在地图上移动时产生3D旋转效果
    // const interactiveMap = document.getElementById('interactive-map');
    // if (interactiveMap) {
    //     interactiveMap.addEventListener('mousemove', (e) => {
    //         const rect = interactiveMap.getBoundingClientRect();
    //         // 计算鼠标相对于元素中心的偏移量（范围约 -0.5 ~ 0.5）
    //         const xOffset = (e.clientX - rect.left) / rect.width - 0.5;
    //         const yOffset = (e.clientY - rect.top) / rect.height - 0.5;
    //         // 应用轻微的3D旋转效果
    //         interactiveMap.style.transform = `rotateX(${yOffset * 10}deg) rotateY(${xOffset * 10}deg)`;
    //     });

    //     interactiveMap.addEventListener('mouseleave', () => {
    //         // 鼠标离开时恢复初始状态
    //         interactiveMap.style.transform = 'rotateX(0deg) rotateY(0deg)';
    //     });
    // }
    
    // 处理导航点击事件
    // 实现平滑滚动到目标区域
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();  // 阻止默认的跳转行为
            
            const targetId = link.getAttribute('href').substring(1);  // 获取目标区域ID
            const targetSection = document.getElementById(targetId);  // 获取目标元素
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });  // 平滑滚动到目标位置
            }
        });
    });
});

// const members = "王宇盛， 刘子东， 彭雷， 周璇， 罗方政";
// const group = "第六小组";
//
// console.log(group);
// console.log(members.split(", "));