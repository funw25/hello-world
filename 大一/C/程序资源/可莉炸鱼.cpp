//她的炸弹拥有从1级到n级的不同威力。其中，第一级炸弹的爆炸半径为r，
//因此其爆炸范围t可计算为r的平方。至于更高级别的炸弹，它们的爆炸范围则是上一级炸弹爆炸范围的m倍。
//他很想知道从1级到n级炸弹的爆炸范围究竟是多少。
//输入三个数n（1 <= n <= 5），r（1 <= r <= 20）和m（1 <= m <= 20）
//输出n个整数，分别代表每一级的炸弹的爆炸范围。
#include<stdio.h>
int main()
{
	int n,r,m,t;
	scanf("%d %d %d",&n,&r,&m);
	n>=1&&n<=5;
	r>=1&&n<=20;
	m>=1&&m<=20;
	t=r*r;
	if(n==1){
		printf("%d",t);
	}
	if(n==2){
		printf("%d %d",t,m);
    }
    if(n==3){
    	printf("%d %d %d",t,t*m,t*m*m);
	}
	if(n==4){
		printf("%d %d %d %d",t,t*m,t*m*m,t*m*m);
	}
	if(n==5){
		printf("%d %d %d %d %d",t,t*m,t*m*m,t*m*m,t*m*m*m);
	}
	return 0;
} 
