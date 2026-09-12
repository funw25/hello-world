//有红、黄、绿三种颜色的球，其中红球3个，黄球3个，绿球6个。
//现将这12个球全部放在一个盒子中，从中任意拿出8个球，编程输出拿出球的各种颜色搭配。
#include"stdio.h"
int main()
{
	int i,j,k;
	for(i=0;i<=3;i++)
	{
		for(j=0;j<=3;j++)
		{
			for(k=0;k<=6;k++)
			{
				if(i+j+k==8){
					printf("red=%d,yellow=%d,green=%d\n",i,j,k);
				}
			}
		}
	}
	return 0;
}
