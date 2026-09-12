//将一笔零钱换成5分、2分和1分的硬币，要求每种硬币至少有一枚，有几种不同的换法？
//输入在一行中给出待换的零钱数额x∈(8,100)。
//要求按5分、2分和1分硬币的数量依次从大到小的顺序，输出各种换法。
//每行输出一种换法，格式为：“fen5:5分硬币数量,fen2:2分硬币数量,fen1:1分硬币数量,total:硬币总数量”。
//最后一行输出“count=换法个数”。
#include <stdio.h>
int main ()
{
	int x,count=0;
	scanf("%d",&x);
	int a,b,c;//要求按5分、2分和1分硬币的数量依次从大到小的顺序 需要倒序
	for(a=x/5;a>0;a--) { //a = 1;a*5<x;a++倒序-> a= x/5;a>0;a--
		for (b=x/2;b>0;b--) {
			for (c=x;c>0;c--) {
				if (a*5+b*2+c==x) {
					printf("fen5:%d, fen2:%d, fen1:%d, total:%d\n",a,b,c,a+b+c);
					count++;
 				}
			}
		}	
	}
	printf("count = %d",count);
	return 0;
}
