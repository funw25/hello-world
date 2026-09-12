//输入一系列整数，要求将其中的最小值与第一个数交换。
//测试数据保证最小值唯一。
//输入在第一行中给出一个正整数N（N≤10），第二行给出N个整数，数字间以空格分隔。
//在一行中顺序输出交换后的序列，每个整数后跟一个空格。
#include"stdio.h"
int main()
{
	int n;
	scanf("%d",&n);
	int number[n];
	for(int i=0;i<n;i++){
		scanf("%d",&number[i]);
	}
	int min=number[0];
	int index=0;
	for(int i=1;i<n;i++){
		if(number[i]<min){
			min=number[i];
			index=i;
		}
	}
   // 交换最小值与第一个数
	int temp = number[0];
    number[0] = min;
    number[index] = temp;
	for(int i=0;i<n;i++){
		printf("%d ",number[i]);
	}
	
	return 0;
}
